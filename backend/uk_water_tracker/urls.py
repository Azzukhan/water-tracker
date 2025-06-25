"""
URL configuration for uk_water_tracker project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/water-levels/', include('water_levels.urls')),
    path('api/weather/', include('weather.urls')),
    path('api/news/', include('news.urls')),
    path('api/blog/', include('blog.urls')),
    path('api/users/', include('users.urls')),
    path('api/newsletter/', include('newsletter.urls')),
    path('api/stories/', include('stories.urls')),
    path('api/support/', include('support.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
