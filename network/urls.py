
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("create", views.create_post, name="create_post"),
    path("posts", views.all_posts, name="all_posts"),
    path("edit_post/<int:post_id>", views.edit_post, name="edit_post"),
]