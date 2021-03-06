//////////////////////////////////////////////////////////////////////
// Map functions
function uiModifyMap()
{
   var reCoordsSpan = /<span *class *= *"[^"]* *coordinates *[^"]*" *>(.+)<\/span>/;
   var rePlayerName = /{k.spieler} *([^<]+)/;
   var reAllianceName = /{k.allianz} *([^<]+)/;
   var reVillageName = /{k.dt} *(.+)/;
   var rePop = /{k.einwohner} *(\d+)/;
   var reOasisTyp = /{a[.]r(\d+)} *(\d+)%/g;
   var reTitleTyp = / *{k[.]f(\d+)} */;
   var reTitleOasis = /{k[.](fo)|(bt)}/;
   var translateDict;

   //-----------------------------------------------------------------
   function getAreaDetails(area)
   {
      var details = null;

      try
      {
         if ( area.wrappedJSObject )
         {
            var areaInfo = area.wrappedJSObject._extendedTipContent;
            if ( areaInfo && areaInfo.hasOwnProperty('title') && areaInfo.hasOwnProperty('text') )
            {
               // retrive cell info from standard tip
               var xy, type, is_oasis, playerName, allianceName, villageName, pop;
               var title = areaInfo.title;

               if ( areaInfo.text.match(reCoordsSpan) )
               {
                  xy = parseCoords(RegExp.$1);
               }

               if ( areaInfo.text.match(rePlayerName) )
               {
                  playerName = RegExp.$1;
               }

               if ( areaInfo.text.match(reAllianceName) )
               {
                  allianceName = RegExp.$1;
               }

               if ( areaInfo.title.match(reVillageName) )
               {
                  villageName = RegExp.$1;
               }

               if ( areaInfo.text.match(rePop) )
               {
                  pop = parseInt10(RegExp.$1);
               }

               is_oasis = (title.search(reTitleOasis) !== -1);

               if ( is_oasis )
               {
                   var oasisType, ri, percent;
                   var percents = [0,0,0,0];

                   reOasisTyp.lastIndex = 0;
                   while ( reOasisTyp.exec(areaInfo.text) )
                   {
                      ri = parseInt10(RegExp.$1) - 1; 
                      percent = parseInt10(RegExp.$2);
                      percents[ri] = percent;
                   }

                   for ( oasisType = 0; oasisType < oasisTypes.length; oasisType++ )
                   {
                      var bMatch = true;
                      for ( ri = 0; ri < 4; ri++ )
                      {
                         if ( oasisTypes[oasisType][ri] !== percents[ri] )
                         {
                            bMatch = false;
                            break;
                         }
                      }
                      if ( bMatch ) 
                      {
                         type = oasisType;
                         break;
                      }
                   }
               }
               else if ( title.match(reTitleTyp) )
               {
                  type = parseInt10(RegExp.$1);
                  title = title.replace(reTitleTyp,"");
               }

               title = title.replace(/{([a-z.]+)}/g, 
                             function(str,key) { return translateDict.get(key); });   

               if ( xy )
               {
                  var mapId = xy2id(xy[0], xy[1]);

                  details = 
                  { 
                     id: mapId, 
                     cellInfo: 
                     {
                        M4_DEBUG({{areaInfo: cloneObject(areaInfo),}})
                        x: xy[0],
                        y: xy[1],
                        lnk: "position_details.php?x=" + xy[0] + "&y=" + xy[1],
                        is_oasis: is_oasis,
                        type: type,
                        title: title,  
                        playerName: playerName,
                        allianceName: allianceName,
                        villageName: villageName,
                        pop: pop
                     }
                  };

                  if ( TBO_SHOW_MAP_TOOLTIPS === "1" )
                  {
                     // remove standard tip
                     delete area.wrappedJSObject._extendedTipContent.title;
                     delete area.wrappedJSObject._extendedTipContent.text;
                  }
               }
            }
         }
      }
      catch (e)
      {
         __DUMP__(e)
      }
      return details;
   }

   //-----------------------------------------------------------------
   function setMapWindow(cx,cy,rows,area)
   {                       
      var sizeX = Math.floor(area/rows);
      var sizeY = rows;

      __ASSERT__( sizeX*sizeY === area, {{"Unknown map size, area=" + area}})

      if ( sizeX*sizeY === area )
      {
         var left = normalizeCoord(cx - Math.floor(sizeX/2));
         var bottom = normalizeCoord(cy - Math.floor(sizeY/2));
         TB3O.MapInfo.setMapWindow(left, bottom, sizeX, sizeY);

         var h = $xf("//h1");
         if ( h )
         {
            h.textContent = uiModifyMap.mapHeader + " " + formatCoords(cx,cy);
         }
         uiRefreshVL_Distance(cx,cy); 
      }
   }

   //-----------------------------------------------------------------
   function uiModifyCell(dx, dy, mapCell, cellInfo)
   {
      var id  = "tb_map_info_" + dx + "_" + dy;
      removeElement($g(id));
      if ( !cellInfo.is_oasis ) 
      {
         if ( mapCell )
         {
            var info = null;
            switch ( cellInfo.type )
            {
               case 1  /*3-3-3-9*/  : info = I("mr4");  break;
               case 2  /*3-4-5-6*/  : info = I("mr3");  break;
               case 4  /*4-5-3-6*/  : info = I("mr2");  break;
               case 5  /*5-3-4-6*/  : info = I("mr1");  break;
               case 6  /*1-1-1-15*/ : info = [I("mr4",[['class','+tbMo12']]),I("mr4",[['class','+tbMo22']])];  break;
               case 7  /*4-4-3-7*/  : info = [I("mr1",[['class','+tbMo13']]),I("mr2",[['class','+tbMo23']]),I("mr4",[['class','+tbMo33']])];  break;
               case 8  /*3-4-4-7*/  : info = [I("mr2",[['class','+tbMo13']]),I("mr3",[['class','+tbMo23']]),I("mr4",[['class','+tbMo33']])];  break;
               case 9  /*4-3-4-7*/  : info = [I("mr1",[['class','+tbMo13']]),I("mr3",[['class','+tbMo23']]),I("mr4",[['class','+tbMo33']])];  break;
               case 10 /*3-5-4-6*/  : info = I("mr2"); break;
               case 11 /*4-3-5-6*/  : info = I("mr3"); break;
               case 12 /*5-4-3-6*/  : info = I("mr1"); break;
            }
            if ( info )
            {
               mapCell.appendChild($div(['id', id], info));
            }
         }
      }
   }

   //-----------------------------------------------------------------
   function uiRefreshMap()
   {
      __ENTER__

      var mapContainer = $g("mapContainer");
      if ( mapContainer )
      {
         var i;
         var mapRowsCount = $xf("count(.//div[" + $xClass('tileRow')+ "])", 'n', mapContainer);
         var mapTiles = $xf(".//div[" + $xClass('tile')+ "]", 'l', mapContainer);
         var centerTile = Math.floor(mapTiles.snapshotLength/2);
         for ( i = 0; i < mapTiles.snapshotLength; ++i )
         {
            var tile = mapTiles.snapshotItem(i);
            var details = getAreaDetails(tile);
            if ( details )
            {
               TB3O.MapInfo.addCell(details.id, details.cellInfo);
               if ( i === centerTile )
               {
                  setMapWindow(details.cellInfo.x,details.cellInfo.y,mapRowsCount,mapTiles.snapshotLength);
               }
            }
         }

         if ( TBO_SHOW_CELL_TYPE === '1' ) 
         {
            var dx, dy;
            for ( dx = 0; dx < TB3O.MapInfo.sizeX; dx++ )
            {
               for ( dy = 0; dy < TB3O.MapInfo.sizeY; dy++ )
               {
                  var cellInfo = TB3O.MapInfo.getCelldXdY(dx,dy)
                  if ( cellInfo )
                  {
                     uiModifyCell(dx, dy, mapTiles.snapshotItem((TB3O.MapInfo.sizeY - dy - 1)*TB3O.MapInfo.sizeX + dx), cellInfo);
                  }
               }
            }
         }

         uiCreateNeighborhoodWidget();

         mapContainer.addEventListener("DOMSubtreeModified", onSubtreeModified, false);
      }
      __EXIT__
   }

   //-----------------------------------------------------------------
   function uiRefreshMapProxy()
   {
      __ENTER__
      if ( uiRefreshMapProxy.timer ) 
      {
         clearTimeout(uiRefreshMapProxy.timer);
      }
      uiRefreshMapProxy.timer = setTimeout(function () 
                                           {
                                              uiRefreshMapProxy.timer = null;
                                              uiRefreshMap();
                                           },
                                           TB3O.Timeouts.map_refresh);
      __EXIT__
   }

   //-----------------------------------------------------------------
   function onSubtreeModified(e)
   {
      if ( hasClass(e.target,"tile") )
      {
         e.currentTarget.removeEventListener("DOMSubtreeModified", onSubtreeModified, false);
         uiRefreshMapProxy();
      }
   }
   
   //-----------------------------------------------------------------
   function uiCreateMapTip(e)
   {
      var content = null;
      if ( e.target.className.match(/x{([+-]?\d+)} +y{([+-]?\d+)}/) )
      {
         var x = RegExp.$1;
         var y = RegExp.$2;
         content = uiCreateCellInfoTooltip(xy2id(x, y));
      }
      return content;
   }

   __ENTER__

   TB3O.MapInfo = new MapInfo();

   var h = $xf("//h1");
   if ( h )
   {
      uiModifyMap.mapHeader = h.textContent;
   } 

   if ( TBO_SHOW_MAP_TOOLTIPS === "1" )
   {
      var maparea = $g("mapContainer");
      if ( maparea )
      {
         uiAddTooltip(maparea, uiCreateMapTip);
      }
   }

   if ( window.wrappedJSObject && window.wrappedJSObject.Travian )
   {
      translateDict = window.wrappedJSObject.Travian.Translation;
   }

   uiRefreshMapProxy();

   __EXIT__
}
