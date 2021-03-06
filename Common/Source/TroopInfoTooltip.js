//////////////////////////////////////////////////////////////////////
// create Troop Info table 
// troopInfo = [tix,count]
function uiCreateTroopInfoTooltip(troopInfo, title)
{
   var tNinfo = calcTroopsTotals([troopInfo]);

   var aTb = $t(['id',"tb_TITT"],
   [
      $e("thead",
         $r(
            $th(['colspan', '6'],
                [(troopInfo[1] > 1 ) ? troopInfo[1] + "\u00D7" : null, 
                 getTroopImage(troopInfo[0]),( title !== "" ) ? " - " + title : null]))),
      $e("tbody",null,
      [
         $r(null,
         [
            //attack power row
            $td(['class', 'tbIco tb3r1'], I("att_all")),
            $td(['class', 'tb3r1 tb3c1'], $ls(tNinfo[5])),
            //def power infantry row
            $td(['class', 'tbIco tb3r1'], I("def_i")),
            $td(['class', 'tb3r1 tb3c2'], $ls(tNinfo[6])),
            //def power cavalry row
            $td(['class', 'tbIco tb3r1'], I("def_c")),
            $td(['class', 'tb3r1 tb3c3'], $ls(tNinfo[7]))
         ]),
         $r(null,
         [
            //speed
            $td(['class', 'tbIco tb3r2'], I("speed" + docDir[0].substring(0,1))),
            $td(['class', 'tb3r2 tb3c1'], ( tNinfo[8] > 0 ) ? $ls(tNinfo[8]) : "?" ),
            //can carry
            $td(['class', 'tbIco tb3r2'], I("capacity")),
            $td(['class', 'tb3r2 tb3c2'], $ls(tNinfo[4])),
            //crop consumption
            $td(['class', 'tbIco tb3r2'], I("r5")),
            $td(['class', 'tb3r2 tb3c3'], $ls(tNinfo[9]))
         ])
      ])   
   ]);

   // Training cost table
   var aTbRes = null;
   var totRes = totalResources(tNinfo);
   if ( totRes )
   {
      var aBody;
      var ri;

      aTbRes = $t(['class', 'tbCost'],
      [
         $e("thead",
            $r(
               $th(['colspan', '2'],T("TCOST")))),
         aBody = $e("tbody")
      ]);

      for ( ri = 0; ri < 4; ++ri )
      {
         aBody.appendChild(
            $r(null,
            [
               $td(['class', 'tbIco'], getResourceImage(ri)),
               $td(['class', 'tbVal'], $ls(tNinfo[ri]))
            ])
         );
      }
      aBody.appendChild(
         $r(['class', 'tbTotal'],
         [
            $td(['class', 'tbIco'], I("r0")),
            $td(['class', 'tbVal'], $ls(totRes))
         ])
      );
   }

   return $div(['class', 'tbTip'], [aTb, (aTbRes) ? $e("hr") : null, aTbRes]);
}

//////////////////////////////////////////////////////////////////////
// Same as uiCreateTroopInfoTooltip
// differ only in arguments tInfo = [tix, title]
function uiCreateTroopInfoTooltip2(tInfo, count)
{
   return uiCreateTroopInfoTooltip([tInfo[0],count],tInfo[1]);
}

//////////////////////////////////////////////////////////////////////
// add tooltips for show troop info
function uiAddTroopInfoTooltips(parent)
{
   __ENTER__

   var arImg = parent.getElementsByTagName("IMG");
   var i, tImg, tInfo, xR, tCell;

   for ( i = 0; i < arImg.length; ++i )
   {
      tImg = arImg[i];
      tInfo = getTroopIndexTitleFromImg(tImg);
      if (tInfo[0] > 0 && tInfo[0] < 51)
      {
         if ( tInfo[1] === '' && TB3O.pageSelector === "dorf1" )
         {
            //for the dorf1.php page where there is no title attribute to the image
            xR = tImg.parentNode;
            if ( xR )
            {
               if ( xR.getAttribute("href") )
               {
                  xR = xR.parentNode;
                  if ( xR ) { xR = xR.parentNode; }
               }
               else
               { 
                  xR = xR.parentNode;
               }

               if ( xR )
               {
                  try
                  {
                     tCell = xR.cells[2];
                     if (tCell) { tInfo[1] = tCell.textContent; }
                  }
                  catch (e)
                  {
                  }
               }
            }
         }
         tImg.removeAttribute('title');
         uiAddTooltip(tImg,bind(uiCreateTroopInfoTooltip2,[tInfo,1]));
      }
   }

   __EXIT__
}
