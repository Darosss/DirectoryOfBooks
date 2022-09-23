const rootStyles = window.getComputedStyle(document.documentElement);

if (
  rootStyles.getPropertyValue("--library-img-width-large") != null &&
  rootStyles.getPropertyValue("--library-img-width-large") != ""
) {
  ready();
} else {
  document.getElementById("main-css").addEvenetListener("load", ready);
}

function ready() {
  const libraryImgWidth = parseFloat(
    rootStyles.getPropertyValue("--library-img-width-large")
  );
  const libraryImgAspectRatio = parseFloat(
    rootStyles.getPropertyValue("--library-img-aspect-ratio")
  );
  const libraryImgHeight = libraryImgWidth / libraryImgAspectRatio;
  FilePond.registerPlugin(
    FilePondPluginImagePreview,
    FilePondPluginImageResize,
    FilePondPluginFileEncode
  );

  FilePond.setOptions({
    stylePanelAspectRatio: 1 / libraryImgAspectRatio,
    imageResizeTargetWidth: libraryImgWidth,
    imageResizeTargetHeight: libraryImgHeight,
  });
  FilePond.parse(document.body);
}
