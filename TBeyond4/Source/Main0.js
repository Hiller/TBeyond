(function() 
{
   //"use strict";
   var crtPage = window.location.href; // OBSOLETE: use crtUrl instead
   var urlNow = window.location.pathname + window.location.search; 
   var crtUrl = parseUri(crtPage);

   var TB3O = {};
   TB3O.TBStartTime = new Date().getTime();
   TB3O.TBEndTime = TB3O.TBStartTime;

   TB3O.version = '4.0.VER_MAJOR.VER_MINOR.VES_REVISION';
   TB3O.url = 'TB_USO_URL_INSTALL';
   TB3O.shN = 'TB{{}}4-SSE{{}}M4_DEBUG({{ (DBG)}})';
   TB3O.sn = '';

   TB3O.BrT = "";
   TB3O.nTARbT = '';
   TB3O.nTASb = '';
   TB3O.nTAUb = '';
   TB3O.nTANb = '';

   TB3O.bIsNPCAvailable = (crtPage.indexOf(".org") === -1); // global setting
   TB3O.bIsNPCInVillage = TB3O.bIsNPCAvailable; 

   TB3O.gServer;
   TB3O.fullServerName;

   TB3O.serverTime;
   TB3O.localTimeOffset = 0;   // offset in milliseconds between serverTime and local time
   TB3O.desiredTimeOffset = 0; // milliseconds added to serverTime to take local time (or 0 if all times need to be like server)

   TB3O.localGP = "";          // path to local graph packet
   TB3O.nLayoutType = 2;       // layout: 0 - standard, 1 - extended, 2 - T4
   TB3O.iLayoutMinWidth = 980; // min width for layout by design, detected automatically later

   TB3O.iBiC = 0;           // count of big icons added

   TB3O.VillagesCount = 1;
   TB3O.VillagesList = null; // store additional info for ingame list of villages 
   TB3O.VillagesList2= null; // store additional info for additional list of villages 
   TB3O.VillagesInfo = {};   // store additional info about villages
   TB3O.ActiveVillageId = undefined;
   TB3O.ActiveVillageMapId = undefined;
   TB3O.ActiveVillageInfo = undefined; // shortcut for TB3O.VillagesInfo[TB3O.ActiveVillageId]

   TB3O.VillagesTrInfo = new PersistentVillageCashe("TrI"); // cashe for training info
   //TB3O.VillagesRPInfo = new PersistentVillageCashe("RPI"); // cashe for rally point info

   TB3O.UserID = '0';
   //user information: username(0), race(1), disprace(2), capital name(3), capital vid(4), capital newdid (5), capitalxy(6), deltaRaceImg (7)
   TB3O.U = ['', '', '', '', '', '', '', 1];

   TB3O.MerchantsInfo = {};
   TB3O.Overview = null; // store additional info for Dorf3

   // current processed page id
   TB3O.pageSelector = "";

   TB3O.hOffBonus = 0;

   TB3O.ServerInfo = undefined;   // { version:4.0, mod:"", features:{} };
   TB3O.nServerType = 0;          // 0 - normal, 1 - speed (3x), 2 - 2x,  3 - 5x, 4 - 4x, 5 - 8x
   TB3O.nMerchantSpeedFactor =    [ 1,           3,              2,       5,      4,      8];
   TB3O.nMerchantCapacityFactor = [ 1,           3,              2,       5,      4,      8];
   TB3O.nTroopSpeedFactor =       [ 1,           2,              2,       2,      2,      3];

   TB3O.ResInfoTotals = new ResourcesInfo();//total production per hour for all villages -> requires to open all villages on a regular basis to get current data

   // different timeouts in milliseconds
   TB3O.Timeouts =
   {
      "ttf_update"   :  1000,   // update "time to fill" interval (1s)
      "min_res_freq" :   500,   // minimal interval to resources counters updates
      "resbar_update": 10000,   // resource bar widget update interval
      "reports_delete":  500,   // pause when delete reports
      "reports_search":  200,   // pause when search reports
      "map_refresh":       0,   // pause between map navigation and updates
      "tooltip":         500,   // pause before displaying tooltip
      "refresh_delay":   500,   // how often heavy-weight UI will update self state after an user do change something (i.e. type in input control)
   };

   // OBSOLETE
   //cpbuilding, barracks, big barracks, workshop, stable, big stable, tournament square, townhall, horse drinking through
   TB3O.d2spB = [0, 0, 0, 0, 0, 0, 0, 0, 0];

   //crt coords
   TB3O.xCrt = null;
   TB3O.yCrt = null;

   //CN colors (CN_COL_TXT, CN_COL_NEUTRAL, CN_COL_MAXLVL, CN_COL_NORES, CN_COL_NPCUPGRADE,CN_COL_NOCAP)
   TB3O.CNc = ['#000000', '#FDF8C1', '#7DFF7D', '#FF9696', '#FFC84B', '#F096F0'];
   TB3O.DFc = ['#000000', 'white'];

   // currently we visit a building that can train new troops
   TB3O.isTtB = false;

   TB3O.lng = 'en';

   TB3O.O = []; // user settings

   //detect doc direction
   var docDir, DOMdocDir;
   if (document.defaultView.getComputedStyle(document.body, null).getPropertyValue("direction") === 'rtl') 
   {
      docDir    = ['right', 'left'];
      DOMdocDir = ['Right', 'Left'];
   }
   else
   {
      docDir    = ['left', 'right'];
      DOMdocDir = ['Left', 'Right'];
   }

   var attrInject$ = ['class','tbInject']; // we add this class to all UI elements that this script append 


   //available races
   var avRace = ['Romans', 'Teutons', 'Gauls'];
   //merchant's speed (normal servers)
   TB3O.MerchantsSpeed = {'Romans': 16, 'Teutons': 12, 'Gauls': 24}
   //merchant's capacity (normal servers, without trade office)
   TB3O.DefaultMerchantsCapacity = {'Romans': 500, 'Teutons': 1000, 'Gauls': 750}

   //available languages
   var arAvLang = ['Server language', 'ae', 'ar', 'ba', 'bg', 'br', 'cl', 'cn', 'cz', 'de', 'dk', 'el', 'en', 'es', 'fi', 'fr', 'gr', 'hk', 'hr', 'hu', 'id', 'il', 'ir', 'it', 'jp', 'kr', 'lt', 'lv', 'mx', 'my', 'nl', 'no', 'ph', 'pl', 'pt', 'ro', 'rs', 'ru', 'si', 'sk', 'th', 'tr', 'tw', 'ua', 'vn'];

   function xTiT(aType, aName, t1) {this.type = aType;this.name = aName;this.t1 = t1;var aD = new Date();aD.setTime(aD.getTime());this.crtDate = aD; return this;}
   function xTtT(tType, necRes, tTime, aRes) {this.necRes = necRes;this.tType = tType;this.tTime = tTime;this.aRes = aRes; return this;}

   var arrTtT = new Array();
   var defaultMF = [5, 5, 4, 2, 4];
   var marketFilters;
   var wsSName;
   var wsAnalysers =	
   [
      ["World Analyser", "http://www.travian.ws/analyser.pl", getUrlWorldAnalyser], 
//      ["Travian Utils",  "http://travian-utils.com",          getUrlTravianUtils], 
      ["Travian-Live",  "http://travian-live.com",            getUrlTravianLive], 
      ["Travian Box",    "http://travianbox.com",             getUrlTravianBox ], 
      ["GetterTools",    "http://www.gettertools.com",        getUrlGetterTools],
   ];
   var mapAnalysers =	
   [
      ["Travmap",        "http://travmap.shishnet.org/",      getUrlTravmap], 
//      ["Flash map",      "http://travian.org.ua/",            getUrlFlashmap],
   ];
   var repSites =		
   [
      ["Travilog",       "http://travilog.org.ua",          function (site) { return site + "/" + TB3O.lng; } ], 
      ["T-Reports.net",  "http://travian-reports.net",      getUrlTravianReports ],
      ["Travian Worlds", "http://report.travianworlds.com", function (site) { return site + "/intl/" + TB3O.lng; }],
      ["4Travian",       "http://4travian.org",             function (site) { return site; } ],
      ["t4log",          "http://www.t4log.com",            function (site) { return site; } ],
   ];

   var warsimLinks = 	
      ["warsim.php", 
       "http://travian.kirilloid.ru/warsim.php"];

   var jsVoid = 'javaScript:void(0)';
   var xGIF = "a/x.gif";

   // most important div's in layout (4.0)
   var ID_SIDE_INFO = 'side_info';
   var ID_HEADER    = 'header';
   var ID_MTOP      = 'mtop';
   var ID_CONTENT   = 'content';
   var ID_MID       = 'mid';
   var ID_MID2      = 'content';

   var gIc = {};        // OBSOLETE, use I() instead
   var t = {}; 

   var NPCResources = 'npcResources';
   var NPCbacklinkName = 'npcBackLink';
   var NPCURL = '/build.php?gid=17&t=3';
   //link to the profile
   var spLnk = '';
   //link to the barracks
   var bksLnk = 'build.php?gid=19';

   TB3O.TBTRT = function() {return TB3O.TBEndTime - TB3O.TBStartTime;}

   __ENTER__
