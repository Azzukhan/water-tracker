# ReservoirWatch: The UK Water Tracker

**ReservoirWatch: The UK Water Tracker** is a unified web platform that consolidates real-time reservoir data from various UK agencies into a single, comprehensive dashboard. It leverages advanced AI models including ARIMA, LSTM neural networks, and regression-based machine learning to provide accurate short-term and long-term water level forecasts. By eliminating data silos among regional water providers, it delivers a complete national overview of reservoir statuses across the UK.

The system integrates contextual information such as weather forecasts, live flood alerts, and educational resources to support informed decision-making. This transparent, interactive tool serves as a scalable model for emergency response, proactive water management, and public awareness initiatives.

## Key Features

### Unified Reservoir Data Integration
- **Multi-Agency Consolidation**: Combines live reservoir data from major UK providers including Severn Trent, Yorkshire Water, Southern Water, the Environment Agency (EA), and Scottish Environment Protection Agency (SEPA)
- **National Overview**: Eliminates fragmented datasets to provide comprehensive nationwide water resource monitoring
- **Real-Time Updates**: Scheduled data ingestion with automated ETL pipelines ensuring up-to-date information

### Advanced AI-Driven Forecasting
- **ARIMA Models**: Statistical time-series analysis for short-term, stable forecasting scenarios
- **LSTM Neural Networks**: Deep learning models capable of capturing complex, non-linear patterns and long-term dependencies
- **Regression Analysis**: Machine learning baselines for trend detection and interpretable predictions
- **Hybrid Ensemble**: Inverse-error-weighted combination of models for optimal accuracy across different scenarios
- **Uncertainty Quantification**: Prediction intervals with confidence bands for risk-aware decision making

### Interactive Data Visualization
- **Dynamic Charts**: Interactive line graphs with hover tooltips, series toggles, and zoom/pan capabilities
- **Forecast Overlays**: Side-by-side comparison of actual vs. predicted reservoir levels
- **Regional Views**: Dedicated pages for each water authority with tailored visualizations
- **Real-Time Updates**: Charts update dynamically through API calls as users navigate different regions

### Comprehensive Accessibility
- **WCAG 2.1 AA Compliance**: Full accessibility standards implementation
- **Accessibility Toolbar**: Dedicated panel with multiple assistive features
- **Dark Mode & High Contrast**: Visual comfort options with color-blind friendly palettes
- **Keyboard Navigation**: Complete site navigation using Tab, Shift+Tab, Enter, and arrow keys
- **Screen Reader Support**: ARIA labels, landmarks, and live regions for assistive technologies
- **Text Scaling**: Adjustable font sizes from 50% to 200%
- **Reading Aids**: Reading ruler and screen mask features for improved focus

### Contextual Intelligence
- **Weather Integration**: Real-time weather forecasts (Tomorrow.io API) linking climatic conditions to reservoir responses
- **Live Alerts**: BBC News feed integration for flood warnings and water-related emergencies
- **Educational Content**: Blog posts and awareness materials on water conservation and sustainability
- **News Hub**: Curated feed of UK water news with search and filtering capabilities

### Enterprise-Grade Architecture
- **Server-Side Rendering (SSR)**: Next.js implementation for enhanced SEO and faster initial page loads
- **RESTful API**: Django REST Framework providing versioned, secure endpoints
- **Background Processing**: Celery + Redis for asynchronous data ingestion and model retraining
- **Containerized Deployment**: Docker configuration for reproducible, scalable deployments
- **Production Monitoring**: Health checks, structured logging, and error tracking

## Technology Stack

### Frontend
- **Next.js 14** (React + TypeScript) - Modern React framework with SSR/ISR capabilities
- **Tailwind CSS** - Utility-first CSS framework for responsive design
- **Recharts** - Declarative charting library for interactive data visualization
- **Leaflet** - Open-source mapping library for geospatial features

### Backend
- **Django 4.2** - Python web framework with robust ORM and admin interface
- **Django REST Framework** - Powerful toolkit for building Web APIs
- **SQLite/PostgreSQL** - Database flexibility from development to production
- **Celery** - Distributed task queue for background processing
- **Redis** - In-memory data structure store for caching and message brokering

### AI/ML Stack
- **Statsmodels** - Statistical modeling and econometrics for ARIMA implementation
- **TensorFlow/Keras** - Deep learning framework for LSTM neural networks
- **scikit-learn** - Machine learning library for regression models and preprocessing
- **NumPy/Pandas** - Scientific computing and data manipulation libraries

### DevOps & Testing
- **Docker & Docker Compose** - Containerization for consistent deployment
- **pytest** - Python testing framework with Django integration
- **GitHub Actions** - CI/CD pipeline for automated testing and deployment
- **Gunicorn** - Python WSGI HTTP Server for production deployment

## Installation & Setup

### Prerequisites
- **Node.js 18+** - For frontend development and building
- **Python 3.10+** - For backend Django application
- **Redis Server** - For background task processing (optional for basic functionality)
- **Docker** (recommended) - For containerized deployment

### Quick Start with Docker

```bash
# Clone the repository
git clone https://github.com/Azzukhan/water-tracker.git
cd uk-water-tracker

# Build and run with Docker Compose
docker-compose up --build

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
```

### Manual Installation

#### 1. Clone Repository
```bash
git clone https://github.com/Azzukhan/water-tracker.git
cd uk-water-tracker
```

#### 2. Backend Setup
```bash
cd backend

# Create and activate virtual environment
python3.12 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Start Django server
python manage.py runserver
```

#### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm i react-leaflet@4
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your API base URL

# Start development server
npm run dev
```

#### 4. Background Worker (Optional)
```bash
# In backend directory with virtual environment activated
celery -A uk_water_tracker worker -B --loglevel=info
```

### Environment Variables

#### Backend (.env)
```env
DJANGO_SECRET_KEY=your-secret-key-here
DJANGO_DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=sqlite:///db.sqlite3
CELERY_BROKER_URL=redis://localhost:6379/0
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_ENVIRONMENT=development
```

## API Documentation

### Water Levels Endpoints
- `GET /api/water-levels/` - List all water level sources
- `GET /api/water-levels/scotland/` - Scottish water data
- `GET /api/water-levels/severn-trent/` - Severn Trent reservoir levels
- `GET /api/water-levels/yorkshire/` - Yorkshire Water data
- `GET /api/water-levels/southern/` - Southern Water reservoir data

### Forecasting Endpoints
- `GET /api/forecasts/{region}/{model}/` - Get forecasts by region and model
- `GET /api/forecasts/accuracy/` - Model accuracy metrics
- `GET /api/forecasts/comparison/` - Multi-model comparison

### Weather & Context
- `GET /api/weather/current/` - Current weather conditions
- `GET /api/news/` - Water-related news feed
- `GET /api/blog/` - Educational content and awareness articles


## Testing

### Backend Testing
```bash
cd backend
pip install -U pytest pytest-django
pytest                    # Run all tests

```





## Deployment

### Production Deployment Options

#### Option 1: Vercel + Railway
- **Frontend**: Deploy to Vercel for global CDN and SSR optimization
- **Backend**: Deploy to Railway for managed infrastructure and PostgreSQL

#### Option 2: Docker-based Deployment
```bash
# Build production images
docker build -t uk-water-tracker-frontend ./frontend
docker build -t uk-water-tracker-backend ./backend

# Deploy with production compose file
docker-compose -f docker-compose.prod.yml up -d
```

#### Option 3: Manual Production Setup
```bash
# Backend production setup
cd backend
pip install -r requirements.txt
python manage.py collectstatic
gunicorn uk_water_tracker.wsgi:application

# Frontend production build
cd frontend
npm run build
npm start
```

### Environment Configuration


## Data Sources

The platform integrates data from the following UK water authorities:

- **Scottish Water/SEPA**: Weekly updates via web scraping and API calls
- **Severn Trent Water**: Weekly reservoir level reports
- **Yorkshire Water**: Monthly PDF reports with automated parsing
- **Southern Water**: Multiple reservoir sites with weekly updates
- **Environment Agency**: River and groundwater level data

## Contributing

We welcome contributions to improve ReservoirWatch! Here's how to get started:

### Development Workflow
1. **Fork the repository** and clone your fork locally
2. **Create a feature branch**: `git checkout -b feature/your-feature-name`
3. **Set up development environment** following the installation guide
4. **Make your changes** with appropriate tests
5. **Run the test suite** to ensure no regressions
6. **Submit a pull request** with a clear description of changes

### Code Standards
- **Python**: Follow PEP 8, use Black formatter, type hints encouraged
- **JavaScript/TypeScript**: Follow ESLint configuration, use Prettier
- **Commit messages**: Use conventional commits (feat:, fix:, docs:, etc.)
- **Testing**: Maintain or improve test coverage for all changes

### Areas for Contribution
- Additional water authority integrations
- Enhanced forecasting models
- Improved accessibility features
- Performance optimizations
- Documentation improvements
- Mobile app development

## Academic Use & Citation

This project was developed as part of Mohammed Afjal Khan's MSc dissertation (2025) at the University of Strathclyde, supervised by Dr. Alasdair Lambert.

### Citation
```
Khan, M. A. (2025). ReservoirWatch: The UK Water Tracker - Empowering the United Kingdom 
with real-time water level monitoring, weather intelligence, and emergency support. 
MSc Dissertation, Department of Computer and Information Sciences, University of Strathclyde.
```



## Contact

### Academic Inquiries
- **Primary Contact**: Mohammed Afjal Khan - mohammed.a.khan.2024@uni.strath.ac.uk
- **Supervisor**: Dr. Alasdair Lambert - University of Strathclyde

### Community
- **Discussions**: Use GitHub Discussions for general questions
- **Email**: For private inquiries related to the project

## Acknowledgments

### Data Providers
- **Severn Trent Water** - Regional reservoir level data
- **Yorkshire Water** - Monthly reservoir reports and data
- **Southern Water** - Multi-reservoir monitoring data
- **Environment Agency** - National water level monitoring
- **Scottish Water/SEPA** - Scottish water resource data

### Technical Dependencies
- **Open Source Libraries**: Statsmodels, TensorFlow, scikit-learn, React, Django
- **Visualization Tools**: Recharts for interactive charts, Leaflet for mapping
- **Infrastructure**: Vercel, Railway, Docker, and the broader open source ecosystem

### Academic Support
- **University of Strathclyde** - Department of Computer and Information Sciences
- **Supervisor**: Dr. Alasdair Lambert for guidance and expertise
- **User Study Participants** - 20 volunteers who provided valuable feedback

---

**ReservoirWatch** represents a significant step forward in UK water resource monitoring, combining cutting-edge AI technology with comprehensive data integration to support better water management decisions. Whether you're a water professional, researcher, emergency responder, or curious citizen, this platform provides the tools and insights needed to understand and respond to the UK's water challenges.

For the latest updates and announcements, visit our [GitHub repository](https://github.com/Azzukhan/water-tracker) and star the project if you find it useful!