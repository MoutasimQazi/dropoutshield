from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import joblib
import os

# ============================================================
# Safe CSV Loader (prevents EmptyDataError)
# ============================================================

def safe_read_csv(path):
    """Load CSV safely. If file is empty or invalid, return empty DataFrame."""
    try:
        if not os.path.exists(path):
            print(f"[safe_read_csv] File not found: {path}")
            return pd.DataFrame()

        if os.path.getsize(path) == 0:
            print(f"[safe_read_csv] File is EMPTY: {path}")
            return pd.DataFrame()

        return pd.read_csv(path)

    except Exception as e:
        print(f"[safe_read_csv] Error reading {path}: {e}")
        return pd.DataFrame()


# ============================================================

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'db')
os.makedirs(DATA_DIR, exist_ok=True)

TEACHERS = ["teacher1", "teacher2", "teacher3"]

def teacher_csv_path(teacher: str) -> str:
    return os.path.join(DATA_DIR, f"{teacher}.csv")

app = Flask(__name__)
CORS(app)

MODEL_FEATURES = [
    "attendance_pct","grades_avg","num_failed_subjects","family_income_bracket",
    "parent_education_level","parent_occupation","distance_to_school",
    "transport_available","extracurricular_participation","disciplinary_records",
    "chronic_health_issues","nutrition_status","teacher_student_ratio",
    "parent_meeting_attendance","intervention_history"
]

NUMERIC_FEATURES = [
    "attendance_pct","grades_avg","num_failed_subjects","distance_to_school",
    "transport_available","extracurricular_participation","disciplinary_records",
    "chronic_health_issues","teacher_student_ratio","parent_meeting_attendance"
]

try:
    model = joblib.load("dropout_model.pkl")
except Exception as e:
    print("[WARN] Model load failed, using heuristic only:", e)
    model = None


def get_risk_level(prob_percent):
    if prob_percent < 35:
        return "Low Risk"
    elif prob_percent < 70:
        return "Moderate Risk"
    else:
        return "High Risk"


@app.route("/", methods=["GET"])
def home():
    return "Dropout Prediction API is running."


# ========== PREPARE FEATURES ==========

def _prepare_feature_frame(records):
    rows = []
    for r in records:
        row = {}
        for col in MODEL_FEATURES:
            row[col] = r.get(col, None)
        rows.append(row)
    df = pd.DataFrame(rows)

    for col in NUMERIC_FEATURES:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce')
        else:
            df[col] = pd.Series([float('nan')]*len(df))
    # Ensure categorical columns exist even if missing
    for col in MODEL_FEATURES:
        if col not in df.columns:
            df[col] = pd.Series(['']*len(df))

    return df


# ========== PREDICT ==========

def _predict_records(records):
    df_feat = _prepare_feature_frame(records)

    for col in df_feat.columns:
        if col in NUMERIC_FEATURES:
            df_feat[col] = df_feat[col].fillna(0)
        else:
            df_feat[col] = df_feat[col].fillna('unknown')

    if model is not None:
        try:
            probs = model.predict_proba(df_feat)[:, 1]
        except Exception as e:
            print('[WARN] model.predict_proba failed, fallback heuristic:', e)
            probs = [_heuristic_probability(r) for r in records]
    else:
        probs = [_heuristic_probability(r) for r in records]

    out = []
    for rec, p in zip(records, probs):
        prob_percent = round(float(p) * 100, 2)
        out.append({
            **rec,
            "dropout_probability_percent": prob_percent,
            "risk_level": get_risk_level(prob_percent)
        })

    return out


# ========== HEURISTIC FALLBACK ==========

def _num(v):
    try:
        if v is None or v == '':
            return float('nan')
        return float(str(v).strip())
    except:
        return float('nan')


def _heuristic_probability(rec):
    attendance = _num(rec.get('attendance_pct'))
    grades = _num(rec.get('grades_avg'))
    failed = _num(rec.get('num_failed_subjects'))
    disciplinary = _num(rec.get('disciplinary_records'))
    chronic = _num(rec.get('chronic_health_issues'))
    distance = _num(rec.get('distance_to_school'))
    transport = _num(rec.get('transport_available'))
    extra = _num(rec.get('extracurricular_participation'))
    nutrition = str(rec.get('nutrition_status','')).lower()
    parent_meet = _num(rec.get('parent_meeting_attendance'))
    ratio = _num(rec.get('teacher_student_ratio'))
    income = str(rec.get('family_income_bracket','')).lower()
    parent_edu = str(rec.get('parent_education_level','')).lower()
    interventions = str(rec.get('intervention_history','')).lower()

    score = 0.0

    if attendance == attendance:
        score += (100 - attendance) * 0.01
    if grades == grades:
        score += max(0, (60 - grades) / 60) * 0.8
    if failed == failed:
        score += min(3, failed) * 0.12
    if disciplinary == disciplinary:
        score += min(5, disciplinary) * 0.08
    if chronic == 1:
        score += 0.15
    if 'low' in income:
        score += 0.18
    elif 'middle' in income:
        score += 0.08
    if any(k in parent_edu for k in ['none','primary']):
        score += 0.12
    if distance == distance:
        score += min(distance/20, 1) * 0.1
    if transport == 0 and distance > 5:
        score += 0.07
    if extra == 1:
        score -= 0.08
    if any(k in nutrition for k in ['under','mal']):
        score += 0.1
    if parent_meet == parent_meet:
        score += max(0, (3 - parent_meet)) * 0.06
    if ratio == ratio:
        score += max(0, (ratio - 30) / 30) * 0.12
    if any(k in interventions for k in ['tutoring','counsel','mentor']):
        score -= 0.05

    score = max(-0.2, min(2.5, score))
    prob = 1/(1 + (2.718281828)**(-2*(score-0.9)))
    return max(0.01, min(0.99, prob))


# ============================================================
# API ROUTES
# ============================================================

@app.route("/predict", methods=["POST"])
def predict_one():
    data = request.json
    if not data:
        return jsonify({"error": "No JSON data provided"}), 400
    result = _predict_records([data])[0]
    return jsonify(result)


@app.route("/predict_csv", methods=["POST"])
def predict_csv():
    try:
        file = request.files.get("file")
        if file is None:
            return jsonify({"error": "Missing file"}), 400

        df = pd.read_csv(file)
        records = df.to_dict(orient="records")
        predicted = _predict_records(records)
        return jsonify(predicted)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ============================================================
# Teacher Data Endpoints (PATCHED WITH SAFE CSV READER)
# ============================================================

@app.route('/teacher/<teacher_id>/data', methods=['GET'])
def get_teacher_data(teacher_id):
    if teacher_id not in TEACHERS:
        return jsonify({"error": "Unknown teacher"}), 404

    path = teacher_csv_path(teacher_id)
    df = safe_read_csv(path)   # ← SAFE

    records = df.to_dict(orient='records')

    need_prediction = request.args.get('predict') == '1'
    # If file missing prediction columns but caller wants predictions, compute and (optionally) persist
    if need_prediction:
        has_cols = 'dropout_probability_percent' in df.columns and 'risk_level' in df.columns
        if not has_cols:
            predicted = _predict_records(records)
            # Persist augmented data to CSV with predictions columns
            df_pred = pd.DataFrame(predicted)
            df_pred.to_csv(path, index=False)
            return jsonify(predicted)
        else:
            return jsonify(records)
    else:
        return jsonify(records)


@app.route('/teacher/<teacher_id>/data', methods=['POST'])
def post_teacher_data(teacher_id):
    if teacher_id not in TEACHERS:
        return jsonify({"error": "Unknown teacher"}), 404

    payload = request.get_json(silent=True)
    # Allow empty list (means clear dataset) but require JSON list
    if payload is None or not isinstance(payload, list):
        return jsonify({"error": "Payload must be a JSON list"}), 400
    print(f"[POST teacher] received payload for {teacher_id}: {len(payload)} records")

    mode = request.args.get('mode', 'replace')
    path = teacher_csv_path(teacher_id)

    existing = []
    if mode == 'append' and os.path.exists(path):
        existing = safe_read_csv(path).to_dict(orient='records')

    combined = existing + payload
    df_write = pd.DataFrame(combined)

    front_cols = ['id','name','class']
    ordered = front_cols + [c for c in MODEL_FEATURES if c in df_write.columns]
    df_write = df_write.reindex(columns=ordered)

    # Compute predictions and include as columns before saving so future loads have them cached
    pred_records = _predict_records(df_write.to_dict(orient='records'))
    df_pred = pd.DataFrame(pred_records)
    df_pred.to_csv(path, index=False)
    try:
        size = os.path.getsize(path)
    except Exception:
        size = None
    print(f"[POST teacher] wrote {path} (size={size}) rows={len(df_write)}")

    stored = df_pred.to_dict(orient='records')
    predictions = stored  # already include prediction columns
    return jsonify({
        "teacher": teacher_id,
        "stored_count": len(stored),
        "predictions": predictions
    }), 201


# ============================================================
# Principal Aggregation (PATCHED)
# ============================================================

@app.route('/principal/data', methods=['GET'])
def principal_data():
    aggregate = []

    for t in TEACHERS:
        path = teacher_csv_path(t)
        df = safe_read_csv(path)
        recs = df.to_dict(orient='records')
        has_pred_cols = 'dropout_probability_percent' in df.columns and 'risk_level' in df.columns
        if request.args.get('predict') == '1' and not has_pred_cols:
            # Compute predictions for this teacher and persist augmentation
            pred = _predict_records(recs)
            df_aug = pd.DataFrame(pred)
            df_aug.to_csv(path, index=False)
            recs = df_aug.to_dict(orient='records')
        for r in recs:
            r['teacher_id'] = t
        aggregate.extend(recs)
    return jsonify(aggregate)

# ------------------------------------------------------------
# Debug endpoint to inspect saved teacher CSV files
# ------------------------------------------------------------
@app.route('/debug/teachers', methods=['GET'])
def debug_teachers():
    summary = []
    for t in TEACHERS:
        path = teacher_csv_path(t)
        exists = os.path.exists(path)
        info = {"teacher": t, "path": path, "exists": exists}
        if exists:
            df = safe_read_csv(path)
            info.update({"rows": len(df), "columns": list(df.columns)})
        summary.append(info)
    return jsonify(summary)


# ============================================================

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=9999)
