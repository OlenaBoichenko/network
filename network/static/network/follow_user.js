document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.follow-button').forEach(button => {
        button.onclick = () => {
            const userId = button.dataset.userId;
            const action = button.textContent.trim() === 'Follow' ? 'follow' : 'unfollow';

            fetch(`/follow/${userId}`, {
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
                    button.textContent = action === 'follow' ? 'Unfollow' : 'Follow';

                    // Update followers count
                    const followersCountElement = document.getElementById('followers-count');
                    let followersCount = parseInt(followersCountElement.textContent);
                    if (action === 'follow') {
                        followersCount += 1;
                    } else {
                        followersCount -= 1;
                    }
                    followersCountElement.textContent = followersCount;
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
