# DropoutShield 🛡️

**AI-Powered Student Retention Platform**

DropoutShield is an intelligent early warning system designed to identify students at risk of dropping out and provide actionable insights to educators. Built with modern web technologies and machine learning, this platform helps schools intervene early and improve student retention rates.

## 🌟 Features

- **AI-Powered Predictions**: Machine learning model analyzes 15+ student factors to predict dropout risk
- **Role-Based Dashboards**: Separate interfaces for teachers and principals with tailored insights
- **Risk Assessment**: Three-tier classification (High, Medium, Low) with visual indicators
- **Data Upload**: Support for CSV bulk uploads and manual student entry
- **Actionable Suggestions**: Context-aware intervention recommendations based on risk factors
- **Real-Time Analytics**: Track class performance, attendance patterns, and risk distributions
- **Secure Authentication**: Protected routes with role-based access control
- **Export Functionality**: Download student data and reports for offline analysis

## 🎓 Survey-Validated

This platform is based on field research conducted at three schools in Solapur district:
- B.Q.K. Girls High School
- The Progressive Urdu High School
- S.S.A. Urdu High School

Key insights from our research:
- Most schools lack digital student tracking systems
- High student-to-teacher ratios impact personalized attention
- Limited counseling resources for at-risk students
- Manual data management creates inefficiencies

## 🚀 Tech Stack

### Frontend
- **React 19.2.0** - Modern UI library with hooks
- **Vite 7.2.4** - Lightning-fast build tool and dev server
- **React Router DOM 6.28.0** - Client-side routing
- **Zustand 4.5.5** - Lightweight state management
- **Tailwind CSS 4.1.17** - Utility-first styling
- **Lucide React** - Beautiful icon library
- **Papa Parse 5.4.1** - CSV file processing

### Backend
- **Python 3.x** - Server-side logic
- **Flask** - Lightweight web framework
- **Scikit-learn** - Machine learning predictions
- **Pandas** - Data processing and analysis

## 📦 Installation

### Prerequisites
- Node.js 16+ and npm
- Python 3.8+
- Git

### Frontend Setup

```bash
# Clone the repository
git clone https://github.com/MoutasimQazi/dropoutshield.git
cd dropoutshield

# Install dependencies
npm install

# Start development server
npm run dev
```

### Backend Setup

```bash
# Navigate to server directory
cd server

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows PowerShell:
.\venv\Scripts\Activate.ps1
# Windows CMD:
.\venv\Scripts\activate.bat
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start Flask server
python app.py
```

## 🎯 Usage

### For Teachers
1. Login with teacher credentials
2. Upload student data via CSV or manual entry
3. View risk predictions and rankings
4. Access personalized intervention suggestions
5. Export data for reporting

### For Principals
1. Login with principal credentials
2. View system-wide analytics across all classes
3. Monitor risk distribution and trends
4. Access aggregated performance metrics
5. Make data-driven decisions for resource allocation

## 📊 Risk Assessment

Students are evaluated on 15 key factors:
- **Academic**: Attendance, grades, study hours, extracurricular participation
- **Family**: Parental education, income level, siblings
- **Health**: Physical and mental health indicators
- **Social**: Peer relationships, previous school changes

**Risk Thresholds:**
- **High Risk**: >70% probability
- **Medium Risk**: 40-70% probability
- **Low Risk**: ≤40% probability

## 🔒 Security

- Protected routes requiring authentication
- Role-based access control (teacher/principal)
- Secure data storage with localStorage fallback
- CSV validation and sanitization

## 🛠️ Project Structure

```
dropoutshield/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Route pages (Landing, Dashboards, Upload)
│   ├── services/       # API and data services
│   ├── store/          # Zustand state management
│   └── assets/         # Images and static files
├── server/
│   ├── app.py          # Flask backend
│   ├── requirements.txt # Python dependencies
│   └── venv/           # Virtual environment
├── db/                 # CSV data files
└── public/             # Public static assets
```

## 🎨 Design System

- **Color Scheme**: Blue-purple gradients for professional, educational aesthetic
- **Typography**: Clean, readable fonts optimized for data display
- **Components**: Rounded corners (rounded-3xl), soft shadows, smooth animations
- **Responsive**: Mobile-first design with breakpoints for all devices
- **Accessibility**: High contrast ratios, semantic HTML, keyboard navigation

## 📝 Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

**MoutasimQazi** - [GitHub](https://github.com/MoutasimQazi)

## 🙏 Acknowledgments

- Schools in Solapur district for participating in our survey research
- Educational institutions supporting dropout prevention initiatives
- Open-source community for the amazing tools and libraries

## 📧 Contact

For questions, suggestions, or collaboration opportunities, please open an issue on GitHub.

---

**Built with ❤️ to keep students in school**
