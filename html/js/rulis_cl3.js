/*ベース地図*/
var blankLayer = new ol.layer.Tile({
    title: '地理院タイル(白地図)',
    type: 'base',
    visible: false,
    source: new ol.source.XYZ({
        attributions: [new ol.Attribution({
            html: "<a href='http://maps.gsi.go.jp/development/ichiran.html' target='_blank'>国土地理院</a>"
        })],
        url: 'http://cyberjapandata.gsi.go.jp/xyz/blank/{z}/{x}/{y}.png'
    })
})
var paleLayer = new ol.layer.Tile({
    title: '地理院タイル(淡色)',
    type: 'base',
    visible: true,
    source: new ol.source.XYZ({
        attributions: [new ol.Attribution({
            html: "<a href='http://maps.gsi.go.jp/development/ichiran.html' target='_blank'>国土地理院</a>"
        })],
        url: 'http://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png'
    })
})
var photoLayer = new ol.layer.Tile({
    title: '地理院タイル(写真)',
    type: 'base',
    visible: false,
    source: new ol.source.XYZ({
        attributions: [new ol.Attribution({
            html: "<a href='http://maps.gsi.go.jp/development/ichiran.html' target='_blank'>国土地理院</a>"
        })],
        url: 'http://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg'
    })
})
var hillLayer = new ol.layer.Tile({
        title: 'エコリス地図タイル(陰影)',
        type: 'base',
        visible: false,
        source: new ol.source.XYZ({
            attributions: [new ol.Attribution({
                html: "<a href='http://map.ecoris.info' target='_blank'>(株)エコリス</a>"
            })],
            url: 'http://map.ecoris.info/tiles/hill/{z}/{x}/{y}.png'
        })
    })



/*オーバーレイ地図*/
var gridSource = new ol.source.TileUTFGrid({
    tileJSON: {
        "jsonp": false,
        //"attribution": "国立研究開発法人 農業環境技術研究",
        "bounds": [122.9, 20.4, 154, 45.6],
        "grids": ["../tiles/rulis_grid/{z}/{x}/{y}.grid.json"],
        "maxzoom": 12,
        "minzoom": 6,
        "scheme": "xyz",
        "tilejson": "2.0.0",
        "version": "1.0.0"
    }
})

var gridLayer = new ol.layer.Tile({
    source: gridSource
})

var MaxZoom = 12;
var MinResolution  = 40075016.68557849/256/Math.pow(2, MaxZoom);

var cl3Layer = new ol.layer.Tile({
    title: "農業景観類型レベル3<div><input id='slider_cl3' type='range' value='70' oninput='changeOpacity(\"cl3\")' onchange='changeOpacity(\"cl3\")'/></div>",
    source: new ol.source.XYZ({
        attributions: [new ol.Attribution({
            html: "<a href='http://www.niaes.affrc.go.jp/' target='_blank'>国立研究開発法人 農業環境技術研究所</a>"
        })],
        url: '../tiles/rulis_cl3/{z}/{x}/{y}.png'
    }),
    opacity: 0.7,
    visible: true,
    minResolution: MinResolution
})
var cl6Layer = new ol.layer.Tile({
    title: "農業景観類型レベル6<div><input id='slider_cl6' type='range' value='70' oninput='changeOpacity(\"cl6\")' onchange='changeOpacity(\"cl6\")'/></div>",
    source: new ol.source.XYZ({
        attributions: [new ol.Attribution({
            html: "<a href='http://www.niaes.affrc.go.jp/' target='_blank'>国立研究開発法人 農業環境技術研究所</a>"
        })],
        url: '../tiles/rulis_cl6/{z}/{x}/{y}.png'
    }),
    opacity: 0.7,
    visible: false,
    minResolution: MinResolution
})

/*レイヤグループ作成（レイヤスイッチャー用）*/
var overlayGroup = new ol.layer.Group({
    title: 'Overlays',
    layers: []
});

var baseGroup = new ol.layer.Group({
    title: 'Base',
    layers: []
});

//baseGroup.getLayers().push(hillLayer);
baseGroup.getLayers().push(photoLayer);
baseGroup.getLayers().push(blankLayer);
baseGroup.getLayers().push(paleLayer);

//overlayGroup.getLayers().push(cl6Layer);
overlayGroup.getLayers().push(cl3Layer);

/*地図初期設定*/
var mapElement = document.getElementById('map');

var map = new ol.Map({
    layers: [baseGroup, overlayGroup, gridLayer],
    target: mapElement,
    controls: ol.control.defaults({
       attributionOptions: ({
         collapsible: false
       })
    }),
    view: new ol.View({
       projection: "EPSG:3857",
       center: ol.proj.transform([138.7313889, 35.3622222], "EPSG:4326", "EPSG:3857"),
       maxZoom: 18,
       zoom: 6
    })
});

/*レイヤスイッチャー追加*/
var layerSwitcher = new ol.control.LayerSwitcher();
map.addControl(layerSwitcher);

/*オーバーレイレイヤの乗算*/
cl3Layer.on("precompose", function(evt) {
    evt.context.globalCompositeOperation = 'multiply';
});
cl3Layer.on("postcompose", function(evt) {
    evt.context.globalCompositeOperation = "source-over";
});
cl6Layer.on("precompose", function(evt) {
    evt.context.globalCompositeOperation = 'multiply';
});
cl6Layer.on("postcompose", function(evt) {
    evt.context.globalCompositeOperation = "source-over";
});

/*透過スライダー処理*/
var changeOpacity = function(layername) {
    if(layername == "cl3"){
       opacity = document.getElementById("slider_cl3").value;
       cl3Layer.setOpacity(opacity/100.0);
    }else if(layername == "cl6"){
       opacity = document.getElementById("slider_cl6").value;
       cl6Layer.setOpacity(opacity/100.0);
    }
}

/*ポップアップ追加*/
var popup = new ol.Overlay.Popup();
map.addOverlay(popup);

/*UTFGridからテーブルを作成*/
var genDataTable = function(data) {
    table =
        "<table border='1' width='210' style='font-size : 12px;'>" +
        "<tr style='background:lightgray'><td colspan='4' align='center'>RuLIS農業生態系区分</td></tr>" +
        "<tr><td>クラス３</td><td align='right' width='30'>" + data.cl3 + "</td><td>クラス６</td><td align='right' width='30'>" + data.cl6 + "</td></tr>" +
        "<tr style='background:lightgray'><td colspan='4' align='center'>土地利用面積率(%)</td></tr>" +
        "<tr><td>田地</td><td align='right'>" + data.rpad + "</td><td>畑地</td><td align='right'>" + data.rara + "</td></tr>" +
        "<tr><td>樹園</td><td align='right'>" + data.rorc + "</td><td>他の樹園</td><td align='right'>" + data.rtree + "</td></tr>" +
        "<tr><td>森林</td><td align='right'>" + data.rfor + "</td><td>荒地</td><td align='right'>" + data.rabd + "</td></tr>" +
        "<tr><td>建物用地</td><td align='right'>" + data.rbuil + "</td><td>幹線交通</td><td align='right'>" + data.rtra + "</td></tr>" +
        "<tr><td>その他用地</td><td align='right'>" + data.run + "</td><td>内水面</td><td align='right'>" + data.rwat + "</td></tr>" +
        "<tr><td>海浜</td><td align='right'>" + data.rcoa + "</td><td>海水域</td><td align='right'>" + data.rsea + "</td></tr>" +
        "<tr style='background:lightgray'><td colspan='4' align='center'>位置コード</td></tr>" +
        "<tr><td>３次メッシュ</td><td align='right' colspan='3'>" + data.m3cd + "</td></tr>" +
        "<tr><td>県行政区</td><td align='right'>" + data.kc + "</td><td>市町村</td><td align='right'>" + data.sc + "</td></tr>" +
        "<tr><td colspan='3' style='background:lightgray'>メッシュデータの有効性<br/>（１：有効、０：NULL）</td><td align='right' colspan='1'>" + data.valid + "</td></tr>" +
        "</table>";
    return table

}

/*マウスホバー処理（UTFGridを表示）*/
map.on('pointermove', function(evt) {
    if (evt.dragging) {
        return;
    }
    var coordinate = map.getEventCoordinate(evt.originalEvent);
    var viewResolution = (map.getView().getResolution());
    gridSource.forDataAtCoordinateAndResolution(coordinate, viewResolution,
        function(data) {
            //ポップアップを表示している場合は表示しない
            if (data && popup.container.style.display != 'block') {
                document.getElementById("tooltip").style.opacity = 1;
                document.getElementById("tooltip").innerHTML = genDataTable(data);

            } else {
                document.getElementById("tooltip").style.opacity = 0;
            }

        });
});


/*ポップアップ処理（UTFGridと凡例へのリンクを表示）*/
map.on('singleclick', function(evt) {
    var coordinate = map.getEventCoordinate(evt.originalEvent);
    var viewResolution = (map.getView().getResolution());
    gridSource.forDataAtCoordinateAndResolution(coordinate, viewResolution,
        function(data) {

            if (data) {
                html = "<div id='popup-legend-open' onclick=\"document.getElementById('legend').style.display='block';\">凡例表示</div><p/>" + genDataTable(data)
                popup.show(coordinate, html);
            }

        });

});

/*凡例の開閉処理*/
document.getElementById("legend-close").setAttribute("onclick", "document.getElementById('legend').style.display='none';document.getElementById('legend-open').style.display='block';");
document.getElementById("legend-open").setAttribute("onclick", "document.getElementById('legend').style.display='block';document.getElementById('legend-open').style.display='none';");