document.addEventListener("scroll", function () {
    onDocumentScroll()
});

const onDocumentScroll = () => {
    adjustHeader()
}

const adjustHeader = () => {
    const header = document.getElementById("header");
    if (window.scrollY > 0) {
        header.classList.add("scrolled");
        return
    }
    header.classList.remove("scrolled");
}