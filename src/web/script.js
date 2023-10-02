// function loadStories() {

    window.addEventListener("DOMContentLoaded", function () {
        fetch("/stories", {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }

        })
        .then((res) => res.json())
        .then((stories) => {
                document.getElementById("storyList").innerHTML = stories.map((story) => {
                    return `<li>${story.name}</li>`
            }).join("");
            })
    }, false);

// }