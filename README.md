# UK Water Tracker (ReservoirWatch)

**ReservoirWatch: The UK Water Tracker** is an integrated web platform that consolidates real-time reservoir data from multiple UK agencies into a single dashboard. It leverages advanced AI models (ARIMA, a regression-based machine learning model, LSTM neural networks, etc.) to generate accurate short-term and long-term water level forecasts. By breaking down data silos between regional water providers, the system offers a comprehensive national view of reservoir levels. It also enriches the data with context like weather forecasts, live flood alerts, and educational content to support informed decision-making. This transparent, interactive tool is designed to aid in emergency response, proactive water resource planning, and public awareness, serving as a scalable model for future water management initiatives.

## Features

* **Unified Reservoir Data:** Aggregates live reservoir level data from major providers (e.g. Severn Trent, Yorkshire Water, Southern Water, Environment Agency, SEPA) into one place, eliminating fragmented datasets and providing a national overview.
* **AI-Powered Forecasts:** Provides dependable water level predictions using advanced algorithms – including ARIMA for statistical time-series forecasts, a regression-based machine learning model for straightforward trend analysis, and LSTM neural networks for complex pattern recognition. Forecasts are updated regularly (e.g. 4-week ahead projections) to help anticipate trends and potential shortages.
* **Interactive Charts:** Visualizes historical vs. predicted reservoir levels with interactive line graphs. Users can hover over data points to see exact values and toggle different data series (actual levels, ARIMA forecast, LSTM forecast, etc.). These charts update dynamically via API calls as users navigate, and tooltips explain technical terms (like “ARIMA” or “LSTM”) for clarity.
* **Responsive & Accessible UI:** Offers a modern, responsive design using Next.js (React + TypeScript) to ensure a smooth user experience on any device. The interface follows accessible web standards, including ARIA labels and basic keyboard navigation support.
* **Accessibility Modes:** Includes a dedicated dark mode for those sensitive to brightness, a color-blind mode with alternate palettes, and full keyboard navigation via Tab, Shift+Tab, Enter, and arrow keys so the entire site can be used without a mouse.
* **Live Contextual Data:** Enhances reservoir info with real-time context — integrating weather forecasts (e.g. Met Office data) to link rainfall/drought conditions with reservoir response, live flood alerts (e.g. from BBC News) for situational awareness, and educational content on water conservation. This turns the dashboard into a one-stop resource for both technical users and the general public.
* **Server-Side Rendering (SSR):** The Next.js front-end uses SSR for improved SEO and faster first-page load. Server-rendering ensures that search engines can crawl pre-rendered HTML and users see content immediately without waiting for heavy client-side JavaScript, resulting in better discoverability and performance. (Client-side interactivity is then handled by React after the initial load.)
* **Robust Backend Architecture:** Powered by a Django backend that exposes a RESTful API (using Django REST Framework, a powerful toolkit for building web APIs). The backend handles data ingestion and forecasting logic, and includes a secure admin interface for managing data. It also offloads long-running tasks (like fetching new data or retraining models) to a Celery worker with a Redis queue, keeping the web app responsive. This design ensures smooth updates: data collection and model updates run asynchronously on a schedule, and the front-end simply requests the latest results via the API.

## Tech Stack

* **Frontend:** Next.js (React + TypeScript) for the web interface and routing, enabling a fast, SSR-enabled React app. Styling uses modern CSS and possibly frameworks (Tailwind or similar) to support dark mode and responsiveness. Charts are implemented with Recharts/D3, and maps with Leaflet.
* **Backend:** Django (Python) with Django REST Framework for the API layer (providing browsable, well-structured REST endpoints). Data is stored in an SQL database – using SQLite by default for simplicity, with the option to switch to PostgreSQL in production. The Django ORM handles data models for reservoir levels and forecasts.
* **AI/ML:** Python scientific stack for forecasting – e.g. **Statsmodels** for ARIMA, **TensorFlow/Keras** for LSTM models, and **scikit-learn** for additional regression-based models. These models are trained on historical data and their predictions are stored in the database for the frontend to fetch.
* **Background Jobs:** **Celery + Redis** for asynchronous tasks. Celery schedules periodic jobs to scrape/update reservoir data from external sources and to retrain or update forecast models as new data arrives. This decouples heavy processing from user requests, so pages load quickly while data updates happen in the background.
* **Testing:** **Pytest** is used for the test suite (with `pytest-django` for Django integration). Pytest offers a simpler, more flexible testing experience than Django’s default test framework, with less boilerplate and powerful features like fixtures and parallel test execution. This ensures new contributions can be verified easily.
* **Containerization:** Docker is used to containerize the application for development and deployment. Both the frontend and backend (and a Celery worker) have Docker configurations, simplifying setup and ensuring consistency between local and production environments. (For example, a Docker Compose file may define the web service, worker, Redis, etc., to emulate the full system locally.)

## Setup and Installation

**Prerequisites:** Make sure you have **Node.js** (for the frontend) and **Python 3.x** (for the backend) installed on your system. We also recommend having **Redis** installed or accessible if you plan to run background tasks. Optionally, Docker and Docker Compose can be used to run the entire stack in containers.

**1. Clone the Repository:**

```bash
git clone https://github.com/example/uk-water-tracker.git
cd uk-water-tracker
```

This repository has two main projects: a `frontend` (Next.js app) and a `backend` (Django project). You may need to set up each part:

**2. Environment Variables:**

Create configuration files for environment variables in both projects (e.g. a `.env.local` in `frontend` and a `.env` in `backend`). Examples of variables you might need to set:

* *Frontend (.env.local):*

  * `NEXT_PUBLIC_API_BASE_URL` – the base URL of the Django API (e.g. `http://localhost:8000` in development).
  * Any API keys or config for map tiles or analytics (if applicable).

* *Backend (.env):*

  * `DJANGO_SECRET_KEY` – a secret key for the Django app (for security).
  * `DJANGO_DEBUG` – set to `True` for development (and `False` in production).
  * `ALLOWED_HOSTS` – hosts/domain names that the Django server will serve (e.g. `localhost, 127.0.0.1` for dev).
  * `DATABASE_URL` – (optional) a database connection string. If not set, Django will use the default SQLite database file. For production, you might use a PostgreSQL URL here.
  * `CELERY_BROKER_URL` – (if using Celery) the Redis URL for the task queue (e.g. `redis://localhost:6379/0`).
  * API endpoints or keys for external data sources (if required, e.g. credentials for an external API).

Check the project documentation or any `.env.example` files for the full list of required variables. **Never commit actual secret values** to the repo; use these .env files which are typically gitignored.

**3. Frontend Setup:**

```bash
cd frontend
# Install dependencies (use npm, pnpm, or yarn - the project is compatible with any Node package manager)
npm install    # or `yarn install` / `pnpm install`
```

After installing, start the development server:

```bash
npm run dev    # or `yarn dev` / `pnpm dev`
```

This will launch the Next.js app on [http://localhost:3000](http://localhost:3000) by default. You should be able to access the UI in your browser. The app will proxy or make API requests to the backend (make sure the backend is running, next step). The frontend is hot-reload enabled, so any changes you make in the React code will refresh in the browser.

**4. Backend Setup:**

Open a new terminal and go to the `backend` directory:

```bash
cd backend
# (Optional) create a virtual environment for Python
python -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate
# Install Python dependencies
pip install -r requirements.txt
```

Apply database migrations to set up the initial schema:

```bash
python manage.py migrate
```

*(If the project includes initial data fixtures or model training, you might run those as needed.)*

Now start the Django development server:

```bash
python manage.py runserver
```

By default, this serves the API at [http://127.0.0.1:8000/](http://127.0.0.1:8000/). You can visit the browsable API (if enabled via Django REST Framework) at that address to explore available endpoints. The Next.js frontend is likely configured to call API endpoints (e.g. `http://localhost:8000/api/...`) for data – with both servers running, the full application should function.

**5. Background Worker (Optional):**

If you want live data updates and forecast retraining in development, you'll need to run the Celery worker process (and have a Redis server running). Assuming Redis is running locally at the default port, start Celery from the `backend` directory:

```bash
# In backend directory, with venv activated and Redis running:
celery -A <your_django_project_name> worker -B --loglevel=info
```

The `-B` flag also starts the Celery beat scheduler (if you have periodic tasks for data fetching). This will execute scheduled jobs (defined in Django settings or Celery config) such as scraping data sources or updating models. With this running, the system will continuously fetch new data in the background, and you’ll see logs for task execution. (Ensure the `CELERY_BROKER_URL` is set to your Redis instance.)

*Note:* You can skip running Celery/Redis if you just want to explore the front-end and use static sample data, but for the full real-time experience, the background tasks should be enabled.

**6. Verify Setup:**

* Open [http://localhost:3000](http://localhost:3000) in your browser to view the frontend. It should load the dashboard. Navigate through different regions/companies to ensure it fetches data (check the browser dev console or Django logs for API requests).
* Access [http://localhost:8000/api/](http://localhost:8000/api/) (or relevant endpoints) to verify the API is responding. For example, you might have endpoints like `/api/reservoirs/` or `/api/forecasts/` – hitting those should return JSON data.
* If everything is configured, you should see current reservoir levels and charts with forecast overlays. Try toggling dark mode (if available) or navigate using the keyboard to test accessibility features.

## Running Tests

We use **Pytest** for automated testing of the project, including backend logic and any utilities. Pytest is developer-friendly and offers powerful features with minimal boilerplate. To run the test suite, make sure your Python virtual environment is active and the necessary test dependencies are installed (pytest and any plugins like pytest-django should be in the requirements). Then simply execute:

```bash
pytest
```

This will discover and run all tests. You should see output of passing tests or any failures with tracebacks. The Django settings for tests (using a temporary database) are typically configured automatically by pytest-django, ensuring an isolated database is created for testing.

If you add new features, please **write corresponding tests** for them. Pytest will pick up any files named `test_*.py`. We encourage writing tests as they help prevent regressions and make future development safer. The project’s reliance on Pytest means you can use fixtures for setup and leverage plugins for coverage or parallel execution as needed. *For frontend code*, if there are any tests (e.g. using Jest or React Testing Library), run `npm test` inside the `frontend` directory (check the `frontend` README for any specific instructions).

## Deployment

The UK Water Tracker is designed to be deployed with a **separated frontend and backend**, which can be hosted on services like Vercel and Railway for a scalable, cloud-based setup:

* **Frontend (Next.js) Deployment – Vercel:** The React frontend is ideal for deployment on Vercel (the platform developed by the creators of Next.js). Vercel automates building and serving Next.js apps, offering excellent support for SSR and static optimizations. To deploy, connect your GitHub repository to Vercel and import the `frontend` project. Vercel will detect the Next.js app (via `package.json` and Next config) and set up a pipeline automatically. Configure environment variables on Vercel (via the project settings) such as `NEXT_PUBLIC_API_BASE_URL` to point to your production backend URL. Once set up, every push to your main branch will trigger Vercel to build and deploy the latest frontend. Vercel provides a global CDN and handles SSR on its edge network, so your app will load quickly for users.

* **Backend (Django) Deployment – Railway:** The Python backend can be deployed to **Railway.app**, a cloud platform that streamlines infrastructure and deployment. Railway supports deploying Dockerized applications or using buildpacks for common languages. We provide a Dockerfile for the backend, which Railway can use to build and run the container. To deploy on Railway:

  1. Create a new project on Railway and link your GitHub repo (or use the Railway CLI).
  2. If using Docker, ensure the Dockerfile is in the backend directory; Railway will auto-detect and build it. If not using Docker, Railway can detect a Django project—specify the start command (like using Gunicorn or Daphne for production).
  3. Add required environment variables in Railway’s dashboard (`DJANGO_SECRET_KEY`, `DEBUG=False`, `ALLOWED_HOSTS`, `DATABASE_URL`, etc.). Railway can provision a PostgreSQL database; use the provided connection string for `DATABASE_URL`. Similarly, if using Celery, provision a Redis instance and set `CELERY_BROKER_URL` accordingly.
  4. Deploy the app. Railway will build the image and start the Django server. Monitor logs and metrics in Railway’s dashboard. The backend will be accessible at a Railway-generated domain (you can add a custom domain). Ensure your frontend is configured to call this API domain in production.

Both Vercel and Railway support continuous deployment. After initial setup, any push to the repository can automatically deploy the new version of the app. For example:

* The `frontend/` directory is linked to Vercel, so pushing changes there triggers a frontend rebuild/deploy.
* The `backend/` directory is linked to Railway, so pushing changes there triggers the backend rebuild/deploy.

**Domain Configuration:** You may use a custom domain for the frontend (e.g. `ukwatertracker.example.com` on Vercel) and possibly a subdomain for the API (e.g. `api.ukwatertracker.example.com` pointing to Railway). If using separate domains, configure CORS in Django to allow requests from the frontend domain.

**Deployment Pipeline:** Use production-ready settings in deployment:

* In Django, use a WSGI/ASGI server like Gunicorn (and possibly WhiteNoise for static files) when deploying. Ensure `DEBUG=False` and proper `ALLOWED_HOSTS` in production settings.
* In Next.js, Vercel will handle the build and hosting. Just make sure environment variables are set appropriately on Vercel.

This setup leverages **Vercel** for the frontend (providing a global CDN and optimized SSR support) and **Railway** for the backend (with easy database and worker provisioning). This separation allows each part to scale independently and uses tools optimized for each environment. *(Alternatively, you could serve the built frontend from Django or use other platforms like Heroku/AWS for the backend, but the Vercel + Railway combination offers a streamlined developer experience.)*

## Contributing

Contributions are welcome! If you’d like to use or extend this project, please follow these guidelines:

* **Project Structure:** Start by familiarizing yourself with the repository layout. The code is split into two main parts: `frontend/` (Next.js app) and `backend/` (Django project). Each part may have its own documentation or README. Understanding this separation will help you make focused changes.
* **Issue Tracking:** If you find a bug or have an idea for a new feature, open an issue on the repository. Use the provided issue templates for bugs or feature requests to help capture relevant details.
* **Branching & Pull Requests:** For contributions, fork the repo (or create a new branch if you have access) and use a descriptive branch name like `feature/your-feature` or `bugfix/issue-number`. Make your changes in that branch, then open a Pull Request to the repository’s main (or development) branch. Clearly describe your changes in the PR and reference any issue it addresses.
* **Coding Style:** Follow the established code style of the project. For Python, adhere to PEP 8 and Django best practices (e.g. clear naming, proper use of the ORM, etc.). Use linters/formatters as configured (such as Black or Flake8) to maintain consistency. For JavaScript/TypeScript, follow the project's ESLint/Prettier configuration. Consistent style makes the codebase easier to maintain.
* **Testing:** Include tests for any new functionality or fixes. Our test suite (run with Pytest) should remain green. Run `pytest` for backend tests (and `npm test` for any frontend tests) before submitting your PR. Update or add tests to cover your changes and ensure you don’t break existing functionality.
* **Documentation:** Update documentation as needed. This could mean editing this README for major user-facing changes, or adding docs in a `docs/` directory. If you add a significant feature, provide usage examples or notes so others can understand it.
* **Commits:** Make atomic commits with clear messages. It’s easier to review and roll back changes when commits are logical and self-contained. If possible, follow a conventional commit style (e.g. prefix commit messages with `feat:`, `fix:`, `docs:`) for clarity.
* **Code Reviews:** Be open to feedback. Project maintainers may suggest changes or improvements during your PR review. Respond to comments and make updates as needed. Constructive dialogue leads to better code quality and shared learning.

By following these guidelines, you help maintain a high-quality codebase and make it easier for others (and your future self) to build on this project. We aim to keep the UK Water Tracker reliable and useful, so we value clean code, thorough testing, and clear documentation. Thank you for contributing!

## Acknowledgments

* Thanks to UK water agencies (Severn Trent, Yorkshire Water, Southern Water, the Environment Agency, SEPA) for making reservoir data available. This project wouldn’t be possible without their data.
* The forecasting models build upon techniques and libraries from the open-source community (including Statsmodels, TensorFlow, and scikit-learn).
* Leaflet and Recharts made it possible to deliver rich interactive visuals easily – we appreciate their developers and maintainers for these great tools.
* Finally, this project was initially developed as part of an MSc dissertation by Mohammed Afjal Khan (2025) under the supervision of **Alasdair Lambert**, and we acknowledge the academic guidance and support behind its inception.
