document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.like-icon').forEach(icon => {
        icon.onclick = () => {
            const postId = icon.dataset.postId;
            const action = icon.classList.contains('fa-heart') ? 'unlike' : 'like';

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
                    // Toggle the like icon
                    if (action === 'like') {
                        icon.classList.remove('fa-heart-o');
                        icon.classList.add('fa-heart');
                    } else {
                        icon.classList.remove('fa-heart');
                        icon.classList.add('fa-heart-o');
                    }

                    // Update like count
                    const likeCount = document.querySelector(`#like-count-${postId}`);
                    likeCount.textContent = result.like_count;
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
