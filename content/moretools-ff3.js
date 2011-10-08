(function() {

var toolsMenuPopup;
var moreToolsMenuPopup;
var origTools=getTools(document);
var nativeToolsNotFound = false;

// \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ //

function getTools(node) {
  function nsResolver() {
    return 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul';
  }

  var doc=node.ownerDocument || node;

  var nodesSnapshot=doc.evaluate(
    "//xul:menupopup[@id='menu_ToolsPopup' or @id='taskPopup']/*",
    doc, nsResolver, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null
  );

  // Awful workaround for Thunderbird
  if (nativeToolsNotFound) {
    /* Since we couldn't detect the native tools on window load, let's hardcode their ids here.
     * References:
     *   http://mxr.mozilla.org/mozilla/source/mail/base/content/mailWindowOverlay.xul
     *   http://mxr.mozilla.org/comm-central/source/mail/base/content/mailWindowOverlay.xul
     * */
    var taskPopupItems = [ 'tasksMenuMail', 'addressBook', 'devToolsSeparator', 'menu_openSavedFilesWnd', 'addonsManager', 'activityManager', 'filtersCmd', 'applyFilters', 'applyFiltersToSelection', 'tasksMenuAfterApplySeparator', 'runJunkControls', 'deleteJunk', 'tasksMenuAfterDeleteSeparator', 'menu_import', 'javaScriptConsole', 'javascriptConsole', 'prefSep', 'menu_accountmgr', 'menu_preferences', 'menu_mac_services', 'menu_mac_hide_app', 'menu_mac_hide_others', 'menu_mac_show_all' ];

    for (var i = 0, l = nodesSnapshot.snapshotLength; i < l; i++)
      for (var j = 0, k = taskPopupItems.length; j < k; j++)
        if (nodesSnapshot.snapshotItem(i).id == taskPopupItems[j]) {
          nodesSnapshot.snapshotItem(i).setAttribute('nativeTool', 'true');
          break;
        }
  }

  return nodesSnapshot;

  var result=[];
  for (var i=0; i<nodesSnapshot.snapshotLength; i++) {
    result.push( nodesSnapshot.snapshotItem(i) );
  }

  return result;
}

function moveAllTools() {
  var mungeFlag=false;
  var currTools=getTools(document);
  for (var i=0; i<currTools.snapshotLength; i++) {
    var el=currTools.snapshotItem(i);
    if (!el.hasAttribute('nativeTool')) {
      if ('menuseparator'==el.tagName) {
        toolsMenuPopup.removeChild(el);
      } else {
        moreToolsMenuPopup.appendChild(el);
      }
      mungeFlag=true;
    }
  }
  if (mungeFlag) {
    document.getElementById('more-tools-label').setAttribute('hidden', true);
    document.getElementById('more-tools-sep').setAttribute('hidden', true);
  }
}

// \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ // \\ //

window.addEventListener('load', function() {
  // Look up nodes now that getElementById() is safe.
  toolsMenuPopup=
    document.getElementById('menu_ToolsPopup') || // firefox
    document.getElementById('taskPopup');         // thunderbird
  moreToolsMenuPopup=document.getElementById('more-tools-menupopup');

  // Mark all tools items that were originally here.
  nativeToolsNotFound = true;
  for (var i=0; i<origTools.snapshotLength; i++) {
    var el=origTools.snapshotItem(i);
    el.setAttribute('nativeTool', 'true');
    if (nativeToolsNotFound) nativeToolsNotFound = false;
  }
  origTools=null;

  // Move any non-marked tools that are already present.
  moveAllTools();

  // Move any non-marked tool that are added later.
  toolsMenuPopup.addEventListener('DOMNodeInserted', moveAllTools, true);
}, true);

})();
