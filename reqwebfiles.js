// import { load } from 'cheerio';
// import { WEB_MAIN_URL } from './crawlconst.js';
// import request from 'request';
// import { writeFile, createWriteStream } from 'fs';
const fs = require('fs')
const cheerio = require('cheerio')
const request = require('request')
const crawlconst = require('./crawlconst')
const path = require('path')


//保存web文件到本地
function SaveToNativeFile(filename, strText) {
    // 第一个参数：文件路径；第二个参数：文件内容； 第三个参数：回调函数； 成功： 文件写入成功
    fs.writeFile(filename, strText, function (error) {
        if (error) {
            console.log(error)
            console.log('写入' + filename + '失败')
        } else {
            console.log('写入' + filename + '成功了')
        }
    })
}


function AnalysisHtml(strHtmlText, imgSavePath) {
    if(strHtmlText == 'undefine' ||strHtmlText.length == 0) {
        console.log('ERROR' + imgSavePath)
        return ''
    }

    // 解析html 获得图片路径并下载
    const $ = cheerio.load(strHtmlText)
    console.log($('img'))   //4DEBUG
    // 直接查询所有 img 标签
    let imgNodes = $('img')

    if (imgNodes.length > 0) {
        let needChangedImgSrc = imgNodes[0].attribs.src.substring(0, imgNodes[0].attribs.src.lastIndexOf('/') + 1)
        // 获得img标签中所有src属性值，并下载图片
        for (let i = 0; i < imgNodes.length; i++) {
            let imgSrc = imgNodes[i].attribs.src.substring(2);
            GetImgUseRequest(crawlconst.WEB_MAIN_URL + encodeURI(imgSrc), imgSavePath)
        }
        //修改img属性值，src改写为当前目录下的图片
        while(-1 != String(strHtmlText).indexOf(needChangedImgSrc))
        {
            strHtmlText = String(strHtmlText).replace(needChangedImgSrc, '')
        }
        return String(strHtmlText)
            
    } 
    // 不存在img则直接返回
    return String(strHtmlText)
}

function RequestFileByGetMethod(reqOption) {
    return new Promise(function (resolve, reject) {
        request(reqOption, function (error, response) {
            if (error) {
                reject(error)
            } else {
                resolve(response)
            }
        })
    })
}

// 通过get方法请求img
function GetImgUseRequest(imgUrl, imgSavePath) {
    var options = {
        'method': 'GET',
        'url': imgUrl,
        'headers': {
            'Cookie': 'acw_tc=65c86a0c16107662014607227eb82614ec87eca5a46234e2a8d57a0027ccce; JSESSIONID=AE202BCC03A95EF7F5A4CDD0EE880CC4'
        }
    };
    let ix = imgUrl.indexOf('/image/')
    let imgName = imgUrl.substring(ix + '/image/'.length)
    console.log(imgUrl)
    let imgFullPath = path.format({
        root: imgSavePath + '\\',
        base: imgName
    })

    fs.stat(imgFullPath, function (err, stat) {
        if (err) {
            request(imgUrl).pipe(fs.createWriteStream(imgFullPath));
        } else {
            if (stat.size > 0) {
                //file exist do nothing 
            } else {
                request(imgUrl).pipe(fs.createWriteStream(imgFullPath));
            }
        }
    })
}

//通过get方法请求html文件, 保存原始html文件，并返回html页面字符串
function GetHtmlUseRequest(riverFullName, reqURL) {
    var options = {
        'method': 'GET',
        'url': reqURL,
        'headers': {
            'Cookie': 'acw_tc=7b39758716106838030225555ee0fd88aea636887df816aed3a899902a4f8a; JSESSIONID=8FF801E43A6C5136BEB53540A892ECC6'
        }
    };
    console.log(reqURL)
    let curPath = path.resolve('./')
    console.log('curPath= ' + curPath)  //4DEBUG

    let imgSavePath = path.resolve(curPath, riverFullName)

    // 原始网页保存文件名
    let rawFilename = path.format({
        dir: imgSavePath,
        name: riverFullName,
        ext: '.raw_html'
    })
    // 修改img路径后的网页保存文件名
    let htmlFilename = path.format({
        dir: imgSavePath,
        name: riverFullName,
        ext: '.html'
    })

    fs.stat(rawFilename, function(err, stat) {
        if(err) {
            //console.log(err)
            // 读取文件错误，从网络请求数据
            RequestFileByGetMethod(options).then(function (data) {
                console.log('!!!DONE!!!' + data)  //4DEBUG
                SaveToNativeFile(rawFilename, data.body)
                let changedHtmlText = AnalysisHtml(data.body, imgSavePath)
                SaveToNativeFile(htmlFilename, changedHtmlText)
            })
        } else {
            // 如果raw_html已经存在，直接读取，不用发送GET请求
            if (stat.size > 0) {
                fs.readFile(rawFilename, function (err, data) {
                    if (err) {
                        console.log(err)
                        throw err
                    }
                    let changedHtmlText = AnalysisHtml(data, imgSavePath)
                    SaveToNativeFile(htmlFilename, changedHtmlText.toString())
                    return
                })
            } else {
                // 文件不存在，从网络请求数据
                RequestFileByGetMethod(options).then(function (data) {
                    console.log('!!!DONE!!!' + data)  //4DEBUG
                    SaveToNativeFile(rawFilename, data.body)
                    let changedHtmlText = AnalysisHtml(data.body, imgSavePath)
                    SaveToNativeFile(htmlFilename, changedHtmlText.toString())
                }, function (err) {
                    console.log(err)
                })
            }
        } 
    })
}

module.exports.AnalysisHtml = AnalysisHtml
module.exports.GetHtmlUseRequest = GetHtmlUseRequest
