(function () {
  'use strict';

  var toolsMenuPopup,
    moreToolsMenuPopup,
    origTools,
    prefs = {
      showWhenEmpty: false,
      toolsToKeep: '',
      nativeToolsToMove: ''
    },
    itemsToKeep,
    nativeTools = 'activityManager|addonsManager|addonsmgr|addressBook|'
      + 'applyFilters|applyFiltersToSelection|browserToolsSeparator|'
      + 'cmd_switchprofile|deleteJunk|devToolsSeparator|downloadmgr|filtersCmd|'
      + 'javascriptConsole|menu_accountmgr|menu_cookieManager|menu_Filters|'
      + 'menu_imageManager|menu_import|menu_openAddons|menu_openDownloads|'
      + 'menu_openSavedFilesWnd|menu_pageInfo|menu_passwordManager|'
      + 'menu_popupManager|menu_preferences|menu_search|menu_search_addresses|'
      + 'menu_SearchAddresses|menu_SearchMail|menu_searchWeb|menu_translate|'
      + 'menu_validate|navBeginGlobalItems|prefSep|privateBrowsingItem|'
      + 'runJunkControls|sanitizeItem|sanitizeSeparator|sep_switchprofile|'
      + 'sep_validate|sync-setup|sync-syncnowitem|tasksDataman|'
      + 'tasksMenuAddressBook|tasksMenuAfterAddressesSeparator|'
      + 'tasksMenuAfterApplySeparator|tasksMenuAfterDeleteSeparator|'
      + 'tasksMenuMail|webDeveloperMenu';

  function loadPrefs() {
    var prefBranch;

    prefBranch = Components.classes['@mozilla.org/preferences-service;1']
      .getService(Components.interfaces.nsIPrefService)
      .getBranch('extensions.moretools.');
    prefs.showWhenEmpty = prefBranch.getBoolPref('showWhenEmpty');
    prefs.nativeToolsToMove = prefBranch.getCharPref('nativeToolsToMove');
    prefs.toolsToKeep = prefBranch.getCharPref('toolsToKeep');
  }

  function updateItemsToKeep() {
    var pattern;

    // Keep in Tools menu the native items.
    pattern = nativeTools;

    // Move to More Tools the native items selected by the user.
    if (prefs.nativeToolsToMove) {
      pattern = pattern.replace(new RegExp('\\b\\|?' +
        prefs.nativeToolsToMove.replace('|', '\\|?\\b|\\b\\|?') +
        '\\|?\\b', 'g'), '');
    }

    // Keep in Tools menu the extension items selected by the user.
    if (prefs.toolsToKeep) {
      pattern += '|' + prefs.toolsToKeep;
    }

    // Keep in Tools menu the items that doesn't have an id.
    pattern += '|';

    itemsToKeep = new RegExp('^(' + pattern + ')$');
  }

  function getTools(node) {
    function nsResolver() {
      return 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul';
    }

    var doc = node.ownerDocument || node;
    return doc.evaluate(
      '//xul:menupopup[@id="menu_ToolsPopup" or @id="taskPopup"]/*',
      doc,
      nsResolver,
      XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
      null
    );
  }

  function moveTools() {
    var i, l, el, currTools, moreToolsMenuIsEmpty;

    currTools = getTools(document);
    for (i = 0, l = currTools.snapshotLength; i < l; i += 1) {
      el = currTools.snapshotItem(i);
      if (!itemsToKeep.test(el.id)) {
        if (el.tagName === 'menuseparator') {
          toolsMenuPopup.removeChild(el);
        } else {
          moreToolsMenuPopup.appendChild(el);
        }
      }
    }

    moreToolsMenuIsEmpty = (moreToolsMenuPopup.childNodes.length === 2);

    if (moreToolsMenuIsEmpty) {
      document.getElementById('more-tools-label').setAttribute('hidden', false);
      document.getElementById('more-tools-sep').setAttribute('hidden', false);
    } else {
      document.getElementById('more-tools-label').setAttribute('hidden', true);
      document.getElementById('more-tools-sep').setAttribute('hidden', true);
    }

    if (moreToolsMenuIsEmpty && !prefs.showWhenEmpty) {
      document.getElementById('more-tools-menu').setAttribute('hidden', true);
    } else {
      document.getElementById('more-tools-menu').setAttribute('hidden', false);
    }
  }

  origTools = getTools(document);
  window.addEventListener('load', function () {
    var i, l, el;

    // Look up nodes now that getElementById() is safe.
    toolsMenuPopup =
      document.getElementById('menu_ToolsPopup') || // Firefox
      document.getElementById('taskPopup');         // Thunderbird, SeaMonkey
    moreToolsMenuPopup = document.getElementById('more-tools-menupopup');

    // Load user-configured options.
    loadPrefs();

    // Mark all tools items that were originally here.
    for (i = 0, l = origTools.snapshotLength; i < l; i += 1) {
      el = origTools.snapshotItem(i);
      nativeTools += '|' + el.id;
    }
    origTools = null;

    // Update the list of items to be kept in Tools menu.
    updateItemsToKeep();

    // Move any non-marked tools that are already present.
    moveTools();

    // Move any non-marked tool that are added later.
    toolsMenuPopup.addEventListener('DOMNodeInserted', moveTools, true);
  }, true);

}());
