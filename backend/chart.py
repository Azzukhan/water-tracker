import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.dates as mdates

# Load Severn Trent data from the provided Excel file
file_path = "SevernTrent_Performance.xlsx"
df = pd.read_excel(file_path)

# Parse dates and filter for ARIMA model
df['date'] = pd.to_datetime(df['date'])
arima_data = df[df['model_type'] == 'ARIMA'].sort_values('date')

# Extract plotting data
dates = arima_data['date']
actual = arima_data['actual_percentage']
predicted = arima_data['predicted_percentage']

# Create line plot
fig, ax = plt.subplots(figsize=(6, 4))
ax.plot(dates, actual, color='blue', marker='o', linestyle='-', linewidth=7, markersize=6, label='Actual Level')
ax.plot(dates, predicted, color='red', marker='s', linestyle='--', linewidth=2, markersize=6, label='ARIMA Predicted')

# Format x-axis to show day and abbreviated month (e.g., 28 Jun, 05 Jul)
ax.xaxis.set_major_locator(mdates.AutoDateLocator())
ax.xaxis.set_major_formatter(mdates.DateFormatter('%d %b'))

# Labels, title, legend
ax.set_xlabel('Date', fontsize=10)
ax.set_ylabel('Reservoir Level (%)', fontsize=10)
ax.set_title('Severn Trent: Actual vs ARIMA Forecast', fontsize=12)
ax.legend(loc='upper left')

# Improve layout
plt.xticks(rotation=45)
plt.tight_layout()

# Save outputs
png_path = "Appendix_FigA2_SevernTrent_DayMonth.png"

fig.savefig(png_path, dpi=300)


# Display the chart
plt.show()

png_path
