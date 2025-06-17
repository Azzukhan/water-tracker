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
