/**
 * Main function, run automatically
 */
(()=>{
    showLoader();
    loadModule('windows', () => {
        hideLoader();
    });
})();