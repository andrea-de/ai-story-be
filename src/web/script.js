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
                // console.log('hi');
                document.getElementById("storyList").innerHTML = stories.map((story) => {
                    return `<li>${story.name}</li>`
            }).join("");
            })
    }, false);

// }