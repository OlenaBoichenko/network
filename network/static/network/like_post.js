// static/network/like_post.js

document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.like-button').forEach(button => {
        button.onclick = () => {
            const postId = button.dataset.postId;
            const action = button.classList.contains('liked') ? 'unlike' : 'like';

            fetch(`/like_post/${postId}`, {
                method: 'PUT',
                body: JSON.stringify({
                    action: action
                }),
                headers: {
                    'X-CSRFToken': getCookie('csrftoken'),
                }
            })
            .then(response => response.json())
            .then(result => {
                if (result.message) {
                    // Toggle the like button appearance
                    button.classList.toggle('liked');
                    button.textContent = button.classList.contains('liked') ? 'Unlike' : 'Like';
                    
                    // Update like count
                    const likeCount = document.querySelector(`#like-count-${postId}`);
                    likeCount.textContent = `Likes: ${result.like_count}`;
                } else if (result.error) {
                    alert(result.error);
                }
            });
        };
    });
});

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
