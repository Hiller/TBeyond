//////////////////////////////////////////////////////////////////////
// Do changes in tables created via uiCreateResAndTimeTable when any
// resource counter countdown to zero
function eventResZeroCountdown(aCell)
{
   var aRowNode = aCell.parentNode;
   if ( aRowNode )
   {
      var aTb = __TEST__($xf("./ancestor::table[@class='rNt']", 'f', aRowNode));
      removeElement(aRowNode);

      if ( aTb )
      {
         // check table, there are present any resources rows with counters?
         var bIsEmpty = !$xf(".//td[contains(@class,'timeout')]", 'f', aTb);

         if ( bIsEmpty )
         {
            // check if table is injected into regular page, in opposite upgrade table updated automatically
            var bIsInjected  = !!$xf("./ancestor::*[@class='tbInject']", 'f', aTb);

            if ( bIsInjected )
            {
               replaceElement(aTb, $txt(T('EXTAV')));
            }
         }
      }
   }
}

//////////////////////////////////////////////////////////////////////
// Do changes in tables created via uiCreateResAndTimeTable when any
// resource counter reach it cap
function eventResCapReached(aCell)
{
   var aRowNode = aCell.parentNode;
   if ( aRowNode )
   {
      addClass(aRowNode,"tbCapReached");
   }
}

//////////////////////////////////////////////////////////////////////
function eventResThresholdCrossing(aCell)
{
   var aRowNode = aCell.parentNode;
   if ( aRowNode )
   {
      toggleClass(aRowNode,"tbMany");
   }
}


//////////////////////////////////////////////////////////////////////
// options{
//    NPC,       (bool) show calculation for NPC
//    NPCLink,   (bool) show link to NPC trade
//    top_title, (bool) show top title
//    id
// }
function uiCreateResAndTimeTable(BA, resourcesInfo, 
                                 aLnk /*opt*/, cpB /*opt*/, ccB /*opt*/, options /*opt*/)
{
   var aTb;
   var ri;
   var boolTb = false;
   var rt = BA[4];
   var cost = BA[3];
   var maxTime = BA[1];

   //-----------------------------------------------------------------
   function addResourceRow(aTb, ri, restante, tiempo)
   {
      var bAdded = false;
      if ( restante > 0 )
      {
         var aCell, rCell;
         var cap = 0;
         var strClass = ( restante >= 100000 ) ? "tbMany" : "";

         if ( ri <= 3 )
         {
//
//    When resources are growing 
// time           restante         warehouse
//  now           x                 y
//  now + 1s      x - 100           y + 100
//  ...              ...
//  future        x - n = cap       y + n = resourcesInfo.Cap
//
//    When resources are decreasing and has it less then need
// time           restante         granary
//  now           x                 y
//  now + 1s      x + 100           y - 100
//  ...              ...
//  future        x + n = cap       y - n = 0

            cap = cost[ri];
            if ( resourcesInfo.EPpH[ri] >= 0 )  
            { 
               cap -= resourcesInfo.Cap[ri]; 
               if ( restante === cap ) 
               {
                  if ( strClass !== "" ) { strClass += " "; }
                  strClass += "tbCapReached";
               }
            }
         }

         if ( isFinite(tiempo) && tiempo > 0 )
         {
            aCell = uiSetTimeSpan($td(), tiempo, {format:0});
         }
         else
         {
            aCell = $td(null, T('NEVER'));
         }

         aTb.appendChild(
            $r([['class', strClass]],
            [
               $td([['class', 'center']],getResourceImage(ri) ),
               rCell = $td([['class', 'timeout' + ri],['title',T("RESREQ_TT",cost[ri])]], restante),
               aCell
            ]));

         if ( cap > 0 )  
         {
            setTBAttribute(rCell, "cap", cap);
         }
          
         bAdded = true;
      }
      return bAdded;
   }

   //-----------------------------------------------------------------
   function addTimeRow(aTb, maxTime)
   {
      var bAdded = false;
      /*
      if ( !isFinite(maxTime) )
      {
         aTb.appendChild($r(null,
                         [
                            $td([['colspan', '2']], T('LISTO') ),
                            $td(null, T('NEVER'))
                         ]));
         bAdded = true;
      }
      else if ( maxTime > 0 )
      {
         var txtDate = formatDateTimeRelative(maxTime, 0);
         aTb.appendChild($r(null,
                         [
                            $td([['colspan', '2']], T('LISTO') ),
                            $td(null, txtDate)
                         ]));
         bAdded = true;
      }
      */
      if ( !isFinite(maxTime) )
      {
         aTb.appendChild($r(null,
                         [
                            $td([['colspan', '3']], T('LISTO') + " " + T('NEVER') )
                         ]));
         bAdded = true;
      }
      else if ( maxTime > 0 )
      {
         var txtDate = formatDateTimeRelative(maxTime, 0);
         aTb.appendChild($r(null,
                         [
                            $td([['colspan', '3']], T('LISTO') + " " + txtDate.toLowerCase())
                         ]));
         bAdded = true;
      }

      return bAdded;
   }

   //-----------------------------------------------------------------
   function addCpcRow(aTb, x, y)
   {
      var titleNode,strClass;
      switch ( y )
      {
         case 'cp':
            titleNode = I("cp");
            strClass = "tbCP";
            break;
         case 'cc':
            titleNode = I("r5");
            strClass = "tbCC";
            break;
      }
      var delta = x[1] - x[0];

      aTb.appendChild(
         $r(null,
            $td([['class', strClass], ['colspan', '3']],
            [
               titleNode,
               $span(": " + x[0] + " " + getArrowChar() + " " + x[1] + (delta > 0 ? " (+" + delta + ")" : ""))
            ])));
   }

   //-----------------------------------------------------------------
   //added by Velonis Petros
   function addCRrows(aTb, aTitle, aV)
   {
      var ri;
      aTb.appendChild($r(null,$th([['colspan', '3']],aTitle)));

      for ( ri = 0; ri < 4; ri++ )
      {
         aTb.appendChild(
            $r(null,
            [
               $td([['class', 'center']],I("r" + (ri + 1)) ),
               $td([['colspan', '2']],aV[ri])
            ]));
      }
   }
   //end of Velonis' addition

   //-----------------------------------------------------------------
   if ( !options )  { options = {}; }
   if ( options.NPCLink === undefined ) { options.NPCLink = options.NPC; }

   aTb = $t([['class', 'rNt']]);

   if ( options.NPC )
   {
      if ( rt[4][0] > 0 )
      {
         aTb.appendChild($r(null,$th([['colspan', '3']],T('NPCNEED'))));
         addResourceRow(aTb, 4, rt[4][0], rt[4][1]);
         addTimeRow(aTb, rt[4][1]);
         boolTb = true;
      }
      else if ( BA[0] === STA_NPCAVAIL && options.NPCLink )
      {
         var id = options.id; 
         if ( !id )
         {
            id = crtUrl.queryKey.id;
         }
         
         var urlNPCback = parseUri(NPCURL);
         
         if ( id )
         {
            urlNPCback.queryKey.bid = id;
         }

         for ( ri = 0; ri < 4; ++ri )  
         { 
            if ( cost[ri] > 0 )
            {
               urlNPCback.queryKey['r'+(ri+1)] = cost[ri];

            }
         }

         aTb.appendChild($r(null,
                            $td([['class','center'],['colspan', '3']],
                               $e("a",[['href',combineUri(urlNPCback)]],T('NPCLNK')))));
         boolTb = true;
      }
   }

   if ( options.top_title || boolTb )
   {
      aTb.appendChild($r(null,$th([['colspan', '3']],T('RESNEED'))));
   }

   for ( ri = 0; ri < 4; ++ri )
   {
      boolTb |= addResourceRow(aTb, ri, rt[ri][0], rt[ri][1]);
   }

   boolTb |= addTimeRow(aTb, maxTime);

   if ( isFinite(maxTime) && maxTime > 0 )
   {
      //added by Velonis Petros - start of addition - the until then row
      if ( TBO_SHOW_UNTIL_THEN_RESIDUE === "1" )
      {
         var uthen = floorResources(getActualResourcesAfterMs(resourcesInfo,maxTime * 1000).res); //obtained until the max time
         var residue = subResources(uthen, cost); //obtained until the max time
         var txtDate = formatDateTimeRelative(maxTime, 0).toLowerCase();
         addCRrows(aTb, T('RESOURCES') + " " + txtDate, uthen);
         addCRrows(aTb, T('RESIDUE') + " " + txtDate, residue);
         //end of Velonis' addition
      }
   }

   if ( aLnk && !boolTb )
   {
      aTb.appendChild($r(null,$td([['class', 'center']],$a(T('EXTAV'), [['href', aLnk]]))));
      boolTb = true;
   }

   if ( cpB && TBO_SHOW_CP_IN_UPGTABLES === "1" )
   {
      addCpcRow(aTb, cpB, "cp");
      //boolTb = true;
   }

   if ( ccB && TBO_SHOW_CC_IN_UPGTABLES === "1" )
   {
      addCpcRow(aTb, ccB, "cc");
      // boolTb = true;
   }

   return ( boolTb ) ? aTb : null;

}

//////////////////////////////////////////////////////////////////////
function uiCreateBuildingResAndTimeTable(arrBA, resourcesInfo, gid, id, crtLevel)
{
   var opt = { NPC: (TBO_SHOW_NPC_IN_UPGTABLES === "1" && TB3O.bIsNPCInVillage),
               id : id };
   var aTB = uiCreateResAndTimeTable(arrBA[id], 
                              resourcesInfo, 
                              "build.php?id=" + id, 
                              [bCost[gid][crtLevel][4], bCost[gid][crtLevel + 1][4]], 
                              [bCost[gid][crtLevel][5], bCost[gid][crtLevel + 1][5]],
                              opt);
   return aTB;
}

//////////////////////////////////////////////////////////////////////
function getCNClass(nState)
{
   return ["tbNoRes","tbUpg","tbNPCUpg","tbNoCap","tbMax"][nState];
}

//////////////////////////////////////////////////////////////////////
function uiCreateCNDiv(lvl, nState, bAlreadyBuilt)
{
   var sClass = getCNClass(nState);
   var aDiv =  $div(['class', 'CNBT ' + sClass], lvl);

   if ( bAlreadyBuilt )
   {
      aDiv.className += " tbUpgNow";
   }

   return aDiv;
}


//////////////////////////////////////////////////////////////////////
// TODO: refresh, enable NPC button
function uiModifyContracts()
{
   __ENTER__
   var i;
   var resourcesInfo = TB3O.ActiveVillageInfo.r;

   // select all contracts except contracts for units training
   var contracts = $xf(
      IIF_TB4({{"//div[@id='" + ID_CONTENT + "']//*[not(self::div and contains(@class,'details'))]/div[contains(@class,'showCosts')]"}},
              {{'//td[@class="required"] | //p[@id="contract"] | //table[@class="new_building"]//td[@class="res"] | //div[@id="' + ID_MID2 + '"]//table[@class="f10"]/tbody/tr[1]/td'}}), 'l');

   for ( i = 0; i < contracts.snapshotLength; i++ )
   {
      var contract = contracts.snapshotItem(i);
      var cost = getRequiredRes(contract);
      
      if ( cost ) 
      {
         var av = getAvailability(cost, resourcesInfo, TB3O.bIsNPCInVillage);
         
         IF_TB3($at(contract, [['id', 'npcXX_1']]);)
         
         var aTb = uiCreateResAndTimeTable(av, resourcesInfo, null, null, null, 
                   { top_title: true,
                     NPC: (TBO_NPC_ASSISTANT === "1" && TB3O.bIsNPCInVillage),
                     NPCLink: false
                   });
         if ( aTb )
         {
            var injectedContainer;
            var xC = contract.parentNode;
            var tag = TAG(xC);
            if ( tag === "TR")
            {
               injectedContainer = $td();
               var aR = $r([['class', 'tb3rnb']]);
               aR.appendChild(injectedContainer);
               xC.parentNode.appendChild(aR);
            }
            else if ( tag === "FORM" || tag === "DIV")
            {
               injectedContainer = $e("p");
               //xC.appendChild(injectedContainer);
               insertAfter(contract,injectedContainer);
            }
            injectedContainer.className = "tbInject";
            injectedContainer.appendChild(aTb);
         }
      }
   }

   IF_TB3({{
   var arrTNPC = $xf("//*[starts-with(@id, 'NPCTT_')]", 'l');
   var aTb = $g("selecttraintroops");
   if ( !aTb )
   {
      aTb = $xf("//table[@class='build_details']");
      if ( aTb )
      {
         for ( i = 0; i < arrTNPC.snapshotLength; i++ )
         {
            var ex = calculateResourceTime(arrTtT[i].aRes, "30");
            if (ex)
            {
               xN = aTb.rows[i + 1].cells[aTb.rows[i + 1].cells.length - 1];
               xN.innerHTML = '';
               xN.appendChild(ex);
            }
         }
      }
   }
   }})

   __EXIT__
}

//////////////////////////////////////////////////////////////////////
function DestinationPicker(fSearch,fCreate)
{
   var xyD = [ __TEST__($xf("//form[@name='snd']//input[@name='x']")),
               __TEST__($xf("//form[@name='snd']//input[@name='y']")) ];

   var x,y;
   var lastX, lastY;
   var self = this;

   //-----------------------------------------------------------------
   this.setXY = function (newX, newY)
   {
      xyD[0].value = newX;
      xyD[1].value = newY;

      fireChangeEvent(xyD[0]);
      fireChangeEvent(xyD[1]);
   }

   //-----------------------------------------------------------------
   this.uiRefresh = function ()
   {
      var oD = $g("tb_unitsdest");
      if ( oD )
      {
         removeChildren(oD);
      }
      else
      {
         var container = fSearch();
         if ( container )
         {
            container.appendChild(oD = $div([['id','tb_unitsdest'],attrInject$]));
         }
      }

      if ( oD ) 
      {
         if ( isXYValid(x,y) )
         {
            var aTb = fCreate(x,y);
            if ( aTb )
            {
               oD.appendChild(aTb);
               oD.style.display = "";
            }
         }
         else
         {
            oD.style.display = "hidden";
         }
      }
   }

   //-----------------------------------------------------------------
   function captureDestination()
   {
      x = parseInt10(xyD[0].value);
      y = parseInt10(xyD[1].value);
      if ( lastX !== x || lastY !== y )
      {
         __DUMP__(x,y)
         lastX = x;
         lastY = y;

         self.uiRefresh();
         uiRefreshVL_Distance(x,y);
      }
   }

   if ( xyD[0] && xyD[1] )
   {
      xyD[0].addEventListener('change', captureDestination, false);
      xyD[0].addEventListener('keyup',  captureDestination, false);
      xyD[1].addEventListener('change', captureDestination, false);
      xyD[1].addEventListener('keyup',  captureDestination, false);
      captureDestination();
   }
}
