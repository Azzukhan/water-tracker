from django.db import models


class ScottishWaterAverageLevel(models.Model):
    """Scotland-wide average water resource levels."""

    date = models.DateField()
    current = models.FloatField()
    change_from_last_week = models.FloatField()
    difference_from_average = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-date"]

    def __str__(self):
        return f"Average {self.date} - {self.current}%"


class ScottishWaterRegionalLevel(models.Model):
    """Regional water resource levels across Scotland."""

    area = models.CharField(max_length=100)
    date = models.DateField()
    current = models.FloatField()
    change_from_last_week = models.FloatField()
    difference_from_average = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("area", "date")
        ordering = ["area"]

    def __str__(self):
        return f"{self.area} {self.date} - {self.current}%"


class SevernTrentReservoirLevel(models.Model):
    """Weekly reservoir levels reported by Severn Trent Water."""

    date = models.DateField(unique=True)
    percentage = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-date"]

    def __str__(self) -> str:  # pragma: no cover - simple representation
        return f"{self.date}: {self.percentage}%"


class SevernTrentReservoirForecast(models.Model):
    """Forecasted reservoir levels for Severn Trent."""

    date = models.DateField()
    predicted_percentage = models.FloatField()
    model_type = models.CharField(max_length=10, choices=(("ARIMA", "ARIMA"), ("LSTM", "LSTM")))

    class Meta:
        unique_together = ("date", "model_type")
        ordering = ["date"]

    def __str__(self) -> str:  # pragma: no cover - simple representation
        return f"{self.date} {self.model_type}: {self.predicted_percentage}%"


class YorkshireWaterReport(models.Model):
    report_month = models.DateField(unique=True)
    rainfall_percent_lta = models.FloatField()
    reservoir_percent = models.FloatField()
    reservoir_weekly_delta = models.FloatField()
    river_condition = models.CharField(max_length=100)
    demand_megalitres_per_day = models.FloatField()
    source_pdf = models.URLField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-report_month"]

    def __str__(self) -> str:  # pragma: no cover
        return f"{self.report_month} - {self.reservoir_percent}%"


class YorkshireWaterPrediction(models.Model):
    date = models.DateField()
    predicted_reservoir_percent = models.FloatField()
    predicted_demand_mld = models.FloatField()
    model_type = models.CharField(max_length=10, choices=(("ARIMA", "ARIMA"), ("LSTM", "LSTM")))

    class Meta:
        unique_together = ("date", "model_type")
        ordering = ["date"]

    def __str__(self) -> str:  # pragma: no cover
        return f"{self.date} {self.model_type}: {self.predicted_reservoir_percent}%"


class YorkshireReservoirData(models.Model):
    """Monthly reservoir level summaries for Yorkshire Water."""

    report_date = models.DateField()
    reservoir_level = models.FloatField()
    weekly_difference = models.FloatField(null=True, blank=True)
    direction = models.CharField(max_length=10)

    class Meta:
        ordering = ["-report_date"]

    def __str__(self) -> str:  # pragma: no cover
        return f"{self.report_date}: {self.reservoir_level}%"

class SouthernWaterReservoirLevel(models.Model):
    """Weekly reservoir levels for Southern Water reservoirs."""

    reservoir = models.CharField(max_length=50)
    date = models.DateField()
    current_level = models.FloatField()
    average_level = models.FloatField()
    change_week = models.FloatField()
    change_month = models.FloatField()
    difference_from_average = models.FloatField()

    class Meta:
        unique_together = ("reservoir", "date")
        ordering = ["reservoir", "-date"]

    def __str__(self) -> str:  # pragma: no cover
        return f"{self.reservoir} {self.date}: {self.current_level}%"


class SouthernWaterReservoirForecast(models.Model):
    """Forecasted levels for Southern Water reservoirs."""

    reservoir = models.CharField(max_length=50)
    date = models.DateField()
    predicted_level = models.FloatField()
    model_type = models.CharField(max_length=10, choices=(("ARIMA", "ARIMA"), ("LSTM", "LSTM")))

    class Meta:
        unique_together = ("reservoir", "date", "model_type")
        ordering = ["reservoir", "date"]

    def __str__(self) -> str:  # pragma: no cover
        return f"{self.reservoir} {self.date} {self.model_type}: {self.predicted_level}%"
