
const crawlconst = require('./crawlconst.js')
const reqwebfiles = require('./reqwebfiles')
const fs = require('fs')
/*		
 1 先分析id和parentId，构建水系树形结构。 获得水系名称， 一级支流，二级支流, ... 名称 
*/
let i = 0
let treeNodes = crawlconst.treeNodes
let mapRiverNet = new Map()
for( i = 0; i < treeNodes.length; i++)
{   
   mapRiverNet.set(treeNodes[i].id, treeNodes[i])
}
console.log(mapRiverNet.size)

function queryRiverFullname(id) {
    let nd = mapRiverNet.get(id)
    let riverFullName = ''
    //按照水系，一级支流，二级支流，...的方式生成河流名称
    while(nd.parentId != '0') {
        riverFullName = nd.name + '_' + riverFullName
        nd = mapRiverNet.get(nd.parentId)
    }
    riverFullName = nd.name + '_' + riverFullName
    // 去掉支流全名最后的下划线
    if ('_' == riverFullName.charAt(riverFullName.length-1)) {
        riverFullName = riverFullName.substring(0, riverFullName.length-1)
    }
    return riverFullName
}
/*
 2 根据水系和name组成输出文件文件名
   如果parentId!=0,则文件名格式如[黑龙江_卧牛河],
   如果parentId=0则文件名就是水系名称，如[黑龙江]
*/

let mapUrl = new Map()

for( i = 0; i < treeNodes.length; i++)
{
    let riverFullName = queryRiverFullname(treeNodes[i].id)
    mapUrl.set(riverFullName, treeNodes[i].param1)
}

console.log(mapUrl.size)

function saveUrls(mapUrls, filename) {
    let fs = require('fs')

    let strText = ''
    for (let [key, value] of mapUrl) {
        strText += key + ',  ' + value + '\n'
    }
    // 第一个参数：文件路径；第二个参数：文件内容； 第三个参数：回调函数； 成功： 文件写入成功
    fs.writeFile(filename, strText, function (error) {
        if (error) {
            console.log('写入失败')
        } else {
            console.log('写入成功了')
        }
    })
}
// saveUrls(mapUrl, 'rivernet.dat')



/*
遍历map列表，逐一请求网页，根据河流全名保存到本地文件
*/
for (let [key, value] of mapUrl) {
    console.log(key + " = " + value);
    //根据河流名创建文件夹
    if (!fs.existsSync(key)) {
        fs.mkdirSync(key)
    }
    setTimeout(function() { reqwebfiles.GetHtmlUseRequest(key, crawlconst.WEB_PAGE_URL + encodeURI(value)) }, 5000);    
}

setTimeout(function(){console.log('end')}, 200000);