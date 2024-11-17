from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render, redirect, get_object_or_404
from django.urls import reverse
 
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.core.paginator import Paginator
import json
from .models import Post, User, Like, Follow



def index(request):
    posts_list = Post.objects.all().order_by("-timestamp")
    paginator = Paginator(posts_list, 10) 

    page_number = request.GET.get('page')
    posts = paginator.get_page(page_number)

    liked_posts = [post.id for post in posts if post.likes.filter(user=request.user).exists()] if request.user.is_authenticated else []

    return render(request, "network/index.html", {
        "posts": posts,
        "liked_posts": liked_posts,
    })


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("all_posts"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")
    
@login_required
def create_post(request):
    if request.method == "POST":
        content = request.POST["content"]
        if content:
            post = Post(user=request.user, content=content)
            post.save()
        return redirect("index")
    return render(request, "network/create_post.html")


def all_posts(request):
    posts_list = Post.objects.all().order_by("-timestamp")
    paginator = Paginator(posts_list, 10)  

    page_number = request.GET.get('page')
    posts = paginator.get_page(page_number)

    liked_posts = [post.id for post in posts if post.likes.filter(user=request.user).exists()] if request.user.is_authenticated else []

    return render(request, "network/all_posts.html", {
        "posts": posts,
        "liked_posts": liked_posts,
    })

@csrf_exempt
@login_required
def edit_post(request, post_id):
    try:
        post = Post.objects.get(pk=post_id, user=request.user)
    except Post.DoesNotExist:
        return JsonResponse({"error": "Post not found or you do not have permission to edit this post."}, status=404)

    if request.method == "PUT":
        data = json.loads(request.body)
        content = data.get("content", "")
        if content:
            post.content = content
            post.save()
            return JsonResponse({"message": "Post updated successfully."}, status=200)
        else:
            return JsonResponse({"error": "Content cannot be empty."}, status=400)

    return JsonResponse({"error": "Invalid request method."}, status=400)

@csrf_exempt
@login_required
def like_post(request, post_id):
    try:
        post = Post.objects.get(pk=post_id)
    except Post.DoesNotExist:
        return JsonResponse({"error": "Post not found."}, status=404)

    if request.method == "PUT":
        data = json.loads(request.body)
        if data.get("action") == "like":
            Like.objects.get_or_create(user=request.user, post=post)
        elif data.get("action") == "unlike":
            Like.objects.filter(user=request.user, post=post).delete()
        else:
            return JsonResponse({"error": "Invalid action."}, status=400)

        return JsonResponse({"message": "Action successful.", "like_count": post.like_count()}, status=200)

    return JsonResponse({"error": "Invalid request method."}, status=400)


@login_required
def profile(request, user_id):
    user_profile = get_object_or_404(User, pk=user_id)
    posts = user_profile.posts.all().order_by("-timestamp")
    followers_count = user_profile.followers.count()
    following_count = user_profile.following.count()

    # Check if the logged-in user is following this profile
    is_following = request.user.is_authenticated and Follow.objects.filter(user=request.user, followed_user=user_profile).exists()


    return render(request, "network/profile.html", {
        "user_profile": user_profile,
        "posts": posts,
        "followers_count": followers_count,
        "following_count": following_count,
        "is_following": is_following
    })

@csrf_exempt
@login_required
def follow_user(request, user_id):
    try:
        user_to_follow = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        return JsonResponse({"error": "User not found."}, status=404)

    if request.method == "PUT":
        data = json.loads(request.body)
        if data.get("action") == "follow":
            if user_to_follow != request.user:
                Follow.objects.get_or_create(user=request.user, followed_user=user_to_follow)
        elif data.get("action") == "unfollow":
            Follow.objects.filter(user=request.user, followed_user=user_to_follow).delete()
        else:
            return JsonResponse({"error": "Invalid action."}, status=400)

        return JsonResponse({"message": "Action successful."}, status=200)

    return JsonResponse({"error": "Invalid request method."}, status=400)

@login_required
def following_posts(request):
    
    following_users = request.user.following.values_list('followed_user', flat=True)
    
    posts = Post.objects.filter(user__in=following_users).order_by('-timestamp')

    liked_posts = [post.id for post in posts if post.likes.filter(user=request.user).exists()]

    return render(request, "network/index.html", {
        "posts": posts,
        "liked_posts": liked_posts,
    })
