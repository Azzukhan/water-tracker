# UK Water Tracker (ReservoirWatch)

**ReservoirWatch: The UK Water Tracker** is a unified web platform that combines real-time reservoir data from various UK agencies into a single dashboard. It uses advanced AI models (such as ARIMA, regression-based machine learning, and LSTM neural networks) to provide accurate forecasts of water levels in the short and long term. By eliminating data silos among regional water providers, it gives a comprehensive national overview of reservoir statuses. The system also adds context like weather forecasts, live flood alerts, and educational resources to support informed decision-making. This transparent, interactive tool aims to assist in emergency response, proactive water management, and public awareness, serving as a scalable model for future water resource initiatives.

## Features

* **Unified Reservoir Data:** Combines live reservoir level information from key providers like Severn Trent, Yorkshire Water, Southern Water, the Environment Agency, and SEPA into a single platform, removing fragmented datasets and delivering a comprehensive national overview.
* **AI-Driven Forecasts:** Provides accurate water level predictions using advanced algorithms like ARIMA for statistical time-series analysis, regression-based machine learning for basic trend detection, and LSTM neural networks for capturing complex patterns. These forecasts are regularly updated (e.g., four-week ahead predictions) to help anticipate trends and potential shortages.
* **Interactive Charts:** These Visualise historical versus predicted reservoir levels using interactive line graphs. Users can hover over data points to view precise values and toggle various data series, such as actual levels, ARIMA, LSTM, and regression forecasts. The charts update dynamically through API calls as users explore, with tooltips providing explanations of technical terms like “ARIMA, " “LSTM,” and "Regression" for better understanding.
* **Responsive & Accessible UI:** Utilises a modern, responsive layout with Next.js (React + TypeScript) to provide a seamless experience across all devices. The interface adheres to accessible web standards, incorporating ARIA labels and fundamental keyboard navigation features.
* **Accessibility Modes:** Offers a dedicated dark mode for brightness sensitivity, a color-blind mode with alternative palettes, and full keyboard navigation using Tab, Shift+Tab, Enter, and arrow keys, enabling complete site use without a mouse.
* **Live Contextual Data:** Improves reservoir information by adding real-time context, such as weather forecasts (e.g., Tomorrow.io) to connect rainfall and drought conditions with reservoir responses, live flood alerts (e.g., from BBC News) for situational awareness, and educational content about water conservation. This makes the dashboard a comprehensive resource for both technical users and the public.
* **Server-Side Rendering (SSR):** Next.js employs SSR to enhance SEO and enable quicker initial page loads. This approach ensures search engines can crawl pre-rendered HTML, and users access content instantly without delays caused by heavy client-side JavaScript, improving discoverability and performance. React then manages interactivity after the initial load.
* **Robust Backend Architecture:** Built on a Django backend that offers a RESTful API using Django REST Framework, a powerful tool for creating web APIs. It manages data input and forecasting processes, featuring a secure admin interface for data management. Long tasks like fetching new data or retraining models are handled by a Celery worker with a Redis queue, ensuring the web app remains responsive. This architecture enables smooth updates: data collection and model retraining occur asynchronously on a schedule, with the front-end retrieving the latest results through the API.

## Tech Stack

* **Frontend:** The web interface and routing are built with Next.js (React + TypeScript), providing a fast, SSR-enabled React application. Styling utilises modern CSS and potentially frameworks like Tailwind to ensure dark mode support and responsiveness. Charts are created using Recharts, while rain maps are developed with Leaflet.
* **Backend:** Built with Django (Python) and Django REST Framework to deliver browsable, well-structured REST API endpoints. Data is stored in an SQL database, initially using SQLite for simplicity, with an option to switch to PostgreSQL in production. The Django ORM manages data models for reservoir levels and forecasts.
* **AI/ML:** Utilises Python's scientific stack for forecasting, including **Statsmodels** for ARIMA, **TensorFlow/Keras** for LSTM models, and **scikit-learn** for other regression-based models. These models are trained on historical data, with their predictions stored in the database for frontend retrieval.
* **Background Jobs:** Using **Celery + Redis** for asynchronous tasks, Celery manages the scheduling of periodic jobs to scrape or update reservoir data from external sources and to retrain or update forecast models as new data becomes available. This setup separates intensive processing from user requests, ensuring pages load swiftly while data updates occur in the background.
* **Testing:** The test suite uses **Pytest** alongside `pytest-django` for Django support. Pytest provides a more straightforward and flexible testing environment compared to Django’s default framework, with less boilerplate and advanced features such as fixtures and parallel execution. This makes verifying new contributions easier.
* **Containerisation:** Docker is employed to containerise the application for both development and deployment. Docker configurations are provided for the frontend, backend, and a Celery worker, which simplifies setup and maintains consistency between local and production environments. For instance, a Docker Compose file might define services such as the web, worker, and Redis to replicate the entire system locally.

## Setup and Installation

**Prerequisites:** Ensure that **Node.js** is installed for the frontend and **Python 3.12** for the backend. It is advised to have **Redis** installed or accessible if you intend to run background tasks. Additionally, Docker and Docker Compose are optional tools that can help run the entire stack in containers.

**1. Clone the Repository:**

```bash
git clone https://github.com/Azzukhan/uk-water-tracker.git
cd uk-water-tracker
```

This repository contains two main projects: a `frontend` (Next.js app) and a `backend` (Django project). You might need to set up each component:

**2. Environment Variables:**

Create configuration files for environment variables in both projects, such as a `.env.local` in `frontend` and a `.env` in `backend`. Examples of variables you might need to set include:

* *Frontend (.env.local):*

  * `NEXT_PUBLIC_API_BASE_URL` – the base URL for the Django API (for example, `http://localhost:8000` during development).

* *Backend (.env):*

  * `DJANGO_SECRET_KEY` – a secret key used for the Django application’s security.
  * `DJANGO_DEBUG` – set to `True` during development and `False` in production.
  * `ALLOWED_HOSTS` – specifies the hosts or domain names that the Django server will serve, such as `localhost` or `127.0.0.1` for development environments.
  * `DATABASE_URL` – (optional) specifies a database connection string. If omitted, Django defaults to using the SQLite database file. For production environments, consider using a PostgreSQL URL here.
  * `CELERY_BROKER_URL` – (if using Celery) the Redis connection URL for the task queue (e.g., `redis://localhost:6379/0`).
  * API endpoints or keys for external data sources (if needed, such as credentials for an external API).

Review the project documentation or any `.env.example` files to see the full list of required variables. **Always avoid committing real secret values** to the repository; instead, use these `.env` files, which are usually added to `.gitignore`.

**3. Frontend Setup:**

```bash
cd frontend
# Install dependencies (use npm, pnpm, or yarn - the project is compatible with any Node package manager)
npm install    
```

After installing, start the development server:

```bash
npm run dev    

This will start the Next.js app at [http://localhost:3000](http://localhost:3000) by default. You can access the UI through your browser. The app will proxy or send API requests to the backend—ensure the backend is running before proceeding. The frontend supports hot-reloading, so any updates to the React code will automatically refresh in the browser.

**4. Backend Setup:**

Open a new terminal and navigate to the `backend` directory:

```bash
cd backend
# (Optional) Set up a virtual environment for Python.
python -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate
# Install Python dependencies
pip install -r requirements.txt
```

Run database migrations to establish the initial schema.

```bash
python manage.py migrate
```

*(The project involves initial data fixtures or model training; ensure to run these as required.)*

Now start the Django development server:

```bash
python manage.py runserver
```

By default, the API is accessible at [http://127.0.0.1:8000/]. If Django REST Framework's browsable API is enabled, you can explore available endpoints at that address. The Next.js frontend is probably set up to call API endpoints (like `http://localhost:8000/api/...`) for data. With both servers running, the entire application should operate smoothly.

**5. Background Worker (Optional):**

To enable live data updates and forecast retraining in development, you must run the Celery worker process with a Redis server active. If Redis is running locally on the default port, start Celery from the `backend` directory.

```bash
# Inside the backend directory, ensure venv is activated and Redis is running:
celery -A uk-water-tracker worker -B --loglevel=info
```

The `-B` flag also initiates the Celery beat scheduler, which is useful if you have periodic tasks like data fetching. It will run scheduled jobs (set in Django settings or the Celery configuration), such as scraping data sources or updating models. When active, the system will continuously fetch new data in the background, and task execution logs will be visible. Make sure the `CELERY_BROKER_URL` points to your Redis instance.

*Note:* You can bypass running Celery/Redis if you'd like to explore the front-end with static sample data. However, to experience the full real-time functionality, background tasks need to be enabled.

**6. Verify Setup:**

* Open [http://localhost:3000](http://localhost:3000) in your browser to access the frontend. The dashboard should load automatically. Explore different regions and companies to verify data is being fetched correctly. You can check the browser's developer console or Django logs for API request details.
* Access [http://localhost:8000/api/](http://localhost:8000/api/) (or relevant endpoints) to check if the API responds. For example, try endpoints such as `/api/weather/stations/` or `api/water-levels/scottish-averages/`; these should return JSON data.
* If all settings are correctly configured, you'll see current reservoir levels and charts with forecast overlays. Test accessibility features by toggling dark mode (if available) or navigating using the keyboard.

## Running Tests

We utilise **Pytest** for automated testing of the project, covering backend logic and utilities. Pytest is user-friendly for developers and provides robust features with minimal boilerplate. To run the tests, activate your Python virtual environment and ensure all required dependencies, such as pytest and relevant plugins like pytest-django, are installed (listed in the requirements). Then, execute the following command:

```bash
pytest
```

This will discover and execute all tests. You should observe the output showing either passing tests or failures along with tracebacks. The Django settings used during testing (which utilise a temporary database) are usually automatically configured by pytest-django, ensuring an isolated database is created specifically for testing.

If you introduce new features, ensure you write corresponding tests. Pytest detects files named `test_*.py`. We recommend writing tests because they prevent regressions and facilitate safer future development. Since the project uses Pytest, you can utilise fixtures for setup and plugins for coverage or parallel runs. *For frontend code*, if tests exist (like with Jest or React Testing Library), execute `npm test` in the `frontend` directory, following any instructions in the `frontend` README.

## Deployment

The UK Water Tracker is intended to be used with a **separated frontend and backend**, which can be hosted on platforms such as Vercel and Railway for a scalable, cloud-based deployment.

* **Frontend (Next.js) Deployment – Vercel:** The React frontend is well-suited for deployment on Vercel, a platform created by Next.js developers. Vercel streamlines building and serving Next.js applications, offering strong support for server-side rendering (SSR) and static optimisation. To deploy, link your GitHub repository to Vercel and import the `frontend` project. Vercel will automatically recognise the Next.js app through `package.json` and configuration files, setting up a deployment pipeline. Set environment variables in the project settings, such as `NEXT_PUBLIC_API_BASE_URL`, to point to your production backend. After configuration, each push to the main branch will trigger Vercel to build and deploy the latest frontend version. Vercel's global CDN and edge network ensure fast loading times for users while handling SSR efficiently.

* **Backend (Django) Deployment – Railway:** The Python backend can be deployed to **Railway.app**, a cloud platform that simplifies infrastructure and deployment processes. Railway supports deploying Dockerized applications or utilising buildpacks for popular languages. We supply a Dockerfile for the backend, enabling Railway to build and run the container. To deploy on Railway: **

  1. Create a new project on Railway and connect your GitHub repository, or alternatively, use the Railway CLI.
  2. When using Docker, place the Dockerfile in the backend directory; Railway will automatically detect and build it. If you're not using Docker, Railway can identify your Django project—just specify the start command, such as Gunicorn or Daphne for production.
  3. Add the necessary environment variables in Railway’s dashboard, such as `DJANGO_SECRET_KEY`, `DEBUG=False`, `ALLOWED_HOSTS`, `DATABASE_URL`, etc. Railway can set up a PostgreSQL database, so use the connection string it provides for `DATABASE_URL`. If you plan to use Celery, also provision a Redis instance and set `CELERY_BROKER_URL` accordingly.
  4. Deploy the app. Railway will generate the image and start the Django server. Keep an eye on logs and metrics via Railway’s dashboard. The backend will be available at a Railway-provided domain, with the option to add a custom one. Make sure your frontend is set up to call this API domain in production.

Both Vercel and Railway offer continuous deployment. Once set up, every push to the repository automatically deploys the latest app version. For example:

* The `frontend/` directory is connected to Vercel, meaning that any push to it will initiate a frontend rebuild and deployment.
* The `backend/` directory is connected to Railway; therefore, any pushed changes will initiate a backend rebuild and deployment.

**Domain Configuration:** You can use a custom domain for the frontend, such as `https://uk-water-tracker.vercel.app/` hosted on Vercel, and potentially a subdomain for the API, like ` https://uk-water-tracker.vercel.app/water-levels` pointing to Railway. If you opt for separate domains, remember to configure CORS in Django to permit requests from the frontend domain.

**Deployment Pipeline:** Ensure the deployment uses production-ready configurations.

* When deploying a Django application, use a WSGI/ASGI server such as Gunicorn, and consider adding WhiteNoise for static files. Ensure that `DEBUG=False` and configure `ALLOWED_HOSTS` correctly in production.
* In Next.js, Vercel manages the build process and hosting. Ensure environment variables are correctly configured on Vercel.

This setup uses **Vercel** for the frontend, offering a global CDN and optimised SSR support, and **Railway** for the backend, providing straightforward database and worker setup. This division enables each component to scale separately and employs tools tailored for each environment. *(Alternatively, you might host the frontend with Django or choose platforms like Heroku or AWS for the backend, but the Vercel and Railway combination delivers a more seamless developer experience.)*

## Contributing

Contributions are encouraged! If you wish to use or expand this project, please adhere to these guidelines:

* **Project Structure:** Begin by getting familiar with the repository's organisation. The code is divided into two primary sections: `frontend/` (a Next.js application) and `backend/` (a Django project). Each section might include its own documentation or README file. Recognising this division will assist you in making targeted modifications.
* **Issue Tracking:** Report bugs or suggest new features by opening an issue on the repository. Use the designated issue templates for bugs or feature requests to ensure all relevant details are included.
* **Branching & Pull Requests:** To contribute, fork the repository or create a new branch if you have permissions, using a clear name such as `feature/your-feature` or `bugfix/issue-number`. Make your modifications on that branch, then submit a Pull Request to the main or development branch of the repository. In the PR description, clearly explain your changes and mention any issue it resolves.
* **Coding Style:** Adhere to the project's established coding conventions. For Python, follow PEP 8 and Django best practices, such as clear naming and proper ORM usage. Employ configured linters/formatters like Black or Flake8 to ensure consistency. For JavaScript/TypeScript, follow the project's ESLint and Prettier settings. Maintaining a consistent style helps keep the codebase easier to manage.
* **Testing:** Add tests for new features or fixes. Ensure the test suite (executed with Pytest) passes without errors. Run `pytest` to test the backend and `npm test` for the frontend before submitting your PR. Update or create tests to reflect your changes and prevent breaking existing functionality.
* **Documentation:** Keep the documentation current as necessary. This might involve editing this README for important user-facing updates or adding new docs in a `docs/` directory. When introducing a major feature, include usage examples or notes to help others understand it.
* **Commits:** Make atomic commits with clear messages. This simplifies reviewing and reverting changes, especially when commits are logical and self-contained. Whenever possible, follow a conventional commit style (e.g., prefix messages with `feat:`, `fix:`, `docs:`) for better clarity.
* **Code Reviews:** Be open to feedback, as project maintainers may suggest modifications or improvements during your PR review. Respond to comments and make the necessary changes. Participating in constructive discussions enhances code quality and promotes mutual learning.

Following these guidelines helps ensure a high-quality codebase and simplifies further development for others and your future self. Our goal is to keep the UK Water Tracker reliable and useful, which is why we prioritise clean code, comprehensive testing, and detailed documentation. Thank you for your contribution!

## Acknowledgments

* Thanks to UK water agencies (Severn Trent, Yorkshire Water, Southern Water, the Environment Agency, SEPA) for providing reservoir data. This project relies on their data for success.
* The forecasting models utilise techniques and libraries from the open-source community, such as Statsmodels, TensorFlow, and scikit-learn.
* Leaflet and Recharts enable the easy creation of rich, interactive visuals. We thank their developers and maintainers for providing these excellent tools.
* Finally, this project was originally created as part of **Mohammed Afjal Khan's** MSc dissertation (2025) under the supervision of **Alasdair Lambert**, and we appreciate the academic guidance and support that contributed to its development.

