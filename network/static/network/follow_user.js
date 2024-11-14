document.addEventListener('DOMContentLoaded', function() {
    const followButton = document.querySelector('.follow-button');

    if (followButton) {
        followButton.onclick = () => {
            const userId = followButton.dataset.userId;
            const action = followButton.textContent.trim() === 'Follow' ? 'follow' : 'unfollow';

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
                    followButton.textContent = action === 'follow' ? 'Unfollow' : 'Follow';
                } else if (result.error) {
                    alert(result.error);
                }
            });
        };
    }
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
