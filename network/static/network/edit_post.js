document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.edit-button').forEach(button => {
        button.onclick = () => {
            const postId = button.dataset.postId;
            const postContent = document.querySelector(`#post-content-${postId}`);

            const textarea = document.createElement('textarea');
            textarea.value = postContent.textContent;
            postContent.replaceWith(textarea);

            button.style.display = 'none';
            const saveButton = document.createElement('button');
            saveButton.textContent = 'Save';
            saveButton.className = 'btn btn-success btn-sm save-button';
            button.parentNode.appendChild(saveButton);

            saveButton.onclick = () => {
                fetch(`/edit_post/${postId}`, {
                    method: 'PUT',
                    body: JSON.stringify({
                        content: textarea.value
                    }),
                    headers: {
                        'X-CSRFToken': getCookie('csrftoken'),
                    }
                })
                .then(response => response.json())
                .then(result => {
                    if (result.message) {
                        const updatedContent = document.createElement('p');
                        updatedContent.id = `post-content-${postId}`;
                        updatedContent.textContent = textarea.value;
                        textarea.replaceWith(updatedContent);

                        saveButton.remove();
                        button.style.display = 'inline';
                    } else if (result.error) {
                        alert(result.error);
                    }
                });
            };
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
