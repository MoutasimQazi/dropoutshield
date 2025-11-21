import { Link } from 'react-router-dom'
import useAuthStore from '../store/useAuthStore'
import { 
  Shield, 
  Upload, 
  BarChart3, 
  Users, 
  TrendingDown, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  Target,
  Brain,
  LineChart,
  GraduationCap,
  FileText,
  School,
  TrendingUp
} from 'lucide-react'

export default function Landing() {
  const user = useAuthStore((s) => s.user)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-60 -left-40 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            {/* Icon with animation */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-blue-600 to-purple-600 p-6 rounded-2xl shadow-2xl transform hover:scale-110 transition-transform duration-300">
                  <Shield className="w-16 h-16 text-white" strokeWidth={2} />
                </div>
              </div>
            </div>

            {/* Main heading with gradient */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
              DropoutShield
            </h1>
            
            <p className="text-xl sm:text-2xl text-gray-600 mb-4 max-w-3xl mx-auto font-light">
              AI-Powered Student Retention Platform
            </p>
            
            <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto leading-relaxed">
              Predict dropout risks, identify at-risk students, and implement data-driven interventions to improve retention rates.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap justify-center gap-4 mb-16">
              {!user ? (
                <>
                  <Link 
                    to="/login" 
                    className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-2"
                  >
                    Get Started
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link 
                    to="/upload" 
                    className="px-8 py-4 bg-white text-gray-700 rounded-xl font-semibold shadow-lg hover:shadow-xl border-2 border-gray-200 hover:border-blue-300 transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-2"
                  >
                    <Upload className="w-5 h-5" />
                    Upload Data
                  </Link>
                </>
              ) : (
                <>
                  {user.role === 'teacher' && (
                    <Link 
                      to="/teacher" 
                      className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-2"
                    >
                      <Users className="w-5 h-5" />
                      Teacher Dashboard
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  )}
                  {user.role === 'principal' && (
                    <Link 
                      to="/principal" 
                      className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-2"
                    >
                      <BarChart3 className="w-5 h-5" />
                      Principal Dashboard
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  )}
                  <Link 
                    to="/upload" 
                    className="px-8 py-4 bg-white text-gray-700 rounded-xl font-semibold shadow-lg hover:shadow-xl border-2 border-gray-200 hover:border-blue-300 transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-2"
                  >
                    <Upload className="w-5 h-5" />
                    Upload Data
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <StatCard 
              icon={<Target className="w-8 h-8" />}
              value="95%"
              label="Prediction Accuracy"
              color="blue"
            />
            <StatCard 
              icon={<Users className="w-8 h-8" />}
              value="10K+"
              label="Students Monitored"
              color="purple"
            />
            <StatCard 
              icon={<TrendingDown className="w-8 h-8" />}
              value="40%"
              label="Dropout Reduction"
              color="green"
            />
            <StatCard 
              icon={<GraduationCap className="w-8 h-8" />}
              value="500+"
              label="Schools Using"
              color="orange"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-4">
              <Sparkles className="w-4 h-4" />
              Powerful Features
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Everything You Need to Prevent Dropouts
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive tools for educators to identify, analyze, and support at-risk students
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Brain className="w-8 h-8" />}
              title="AI Risk Prediction"
              description="Advanced machine learning algorithms analyze multiple factors to predict dropout risk with high accuracy."
              gradient="from-blue-500 to-cyan-500"
            />
            <FeatureCard
              icon={<BarChart3 className="w-8 h-8" />}
              title="Real-time Analytics"
              description="Monitor student performance, attendance, and engagement metrics in real-time dashboards."
              gradient="from-purple-500 to-pink-500"
            />
            <FeatureCard
              icon={<Target className="w-8 h-8" />}
              title="Targeted Interventions"
              description="Get personalized action plans and recommendations for each at-risk student."
              gradient="from-orange-500 to-red-500"
            />
            <FeatureCard
              icon={<LineChart className="w-8 h-8" />}
              title="Trend Analysis"
              description="Track patterns and trends across classrooms, grades, and demographic groups."
              gradient="from-green-500 to-emerald-500"
            />
            <FeatureCard
              icon={<Users className="w-8 h-8" />}
              title="Multi-Role Access"
              description="Customized dashboards for teachers, principals, and administrators with role-based permissions."
              gradient="from-indigo-500 to-blue-500"
            />
            <FeatureCard
              icon={<Upload className="w-8 h-8" />}
              title="Easy Data Import"
              description="Upload CSV files or integrate with your existing student information systems seamlessly."
              gradient="from-pink-500 to-rose-500"
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simple, powerful workflow in three easy steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ProcessStep
              number="1"
              title="Upload Data"
              description="Import your student data via CSV or connect your existing systems. We handle the rest securely."
              icon={<Upload className="w-6 h-6" />}
            />
            <ProcessStep
              number="2"
              title="AI Analysis"
              description="Our machine learning models analyze attendance, grades, behavior, and socioeconomic factors."
              icon={<Brain className="w-6 h-6" />}
            />
            <ProcessStep
              number="3"
              title="Take Action"
              description="Review risk scores, get personalized recommendations, and implement targeted interventions."
              icon={<CheckCircle2 className="w-6 h-6" />}
            />
          </div>
        </div>
      </section>

      {/* Survey Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold mb-4">
              <FileText className="w-4 h-4" />
              Field Research
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Our Survey Findings
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We conducted comprehensive field surveys in three government schools in Solapur district to understand the real challenges facing student retention
            </p>
          </div>

          {/* School Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <SurveySchoolCard
              name="B.Q.K. Girls High School"
              image="/src/assets/survey-images/BQK.jpg"
            />
            <SurveySchoolCard
              name="The Progressive Urdu High School"
              image="/src/assets/survey-images/TheProgressive.jpg"
            />
            <SurveySchoolCard
              name="S.S.A. Urdu High School"
              image="/src/assets/survey-images/SSA.jpg"
            />
          </div>

          {/* Key Insights */}
          <div className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 md:p-12 text-white">
            <h3 className="text-2xl md:text-3xl font-bold mb-6 text-center">Key Survey Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Digital Systems Work Better</h4>
                  <p className="text-blue-100">Schools with digital attendance tracking showed 12% higher attendance rates and better academic outcomes.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Teacher Ratio Matters</h4>
                  <p className="text-blue-100">Lower student-teacher ratios correlated with better retention and more personalized student support.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Counseling Reduces Dropouts</h4>
                  <p className="text-blue-100">Schools with structured counseling and mentoring programs showed significantly lower dropout rates.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Data Organization Critical</h4>
                  <p className="text-blue-100">Well-maintained records enable faster intervention and better tracking of at-risk students.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 shadow-2xl transform hover:scale-105 transition-transform duration-300">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to Transform Student Retention?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join hundreds of schools already using DropoutShield to keep students on track
            </p>
            <Link 
              to={user ? (user.role === 'teacher' ? '/teacher' : '/principal') : '/login'}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
            >
              {user ? 'Go to Dashboard' : 'Get Started Now'}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

function StatCard({ icon, value, label, color }) {
  const colors = {
    blue: 'from-blue-500 to-cyan-500',
    purple: 'from-purple-500 to-pink-500',
    green: 'from-green-500 to-emerald-500',
    orange: 'from-orange-500 to-amber-500'
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 border border-gray-100">
      <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${colors[color]} text-white mb-4`}>
        {icon}
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-gray-600 font-medium">{label}</div>
    </div>
  )
}

function FeatureCard({ icon, title, description, gradient }) {
  return (
    <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-gray-100">
      <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${gradient} text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  )
}

function ProcessStep({ number, title, description, icon }) {
  return (
    <div className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300">
      <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-lg">
        {number}
      </div>
      <div className="flex items-center gap-3 mb-4 mt-2">
        <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
          {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
      </div>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  )
}

function SurveySchoolCard({ name, image }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 overflow-hidden border border-gray-100">
      <div className="relative h-64 bg-gray-200 overflow-hidden">
        <img 
          src={image} 
          alt={name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        <div className="absolute bottom-6 left-6 right-6">
          <h3 className="text-white font-bold text-xl">{name}</h3>
        </div>
      </div>
    </div>
  )
}
