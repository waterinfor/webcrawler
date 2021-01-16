const path = require('path')
const fs = require('fs')


var deletedStr = '../page/resource_showImg?path=水利社库/图书/EF5C9331CF3D43D494BC479B938FD910/image/'
var folderStarts = ['黑龙江', '辽河', '入黄海水系', '入渤海水系', '入日本海水系']

const basePath = 'D:\\Lecture\\VueProject\\Lesson1\\JSnipper\\webcrawler'


function mapDir(dir, callback, finish) {
    fs.readdir(dir, function (err, files) {
        if (err) {
            console.error(err)
            return
        }
        files.forEach((filename, index) => {
            let pathname = path.join(dir, filename)

            fs.stat(pathname, (err, stats) => { // 读取文件信息
                if (err) {
                    console.log('获取文件stats失败')
                    return
                }
                if (stats.isDirectory()) {
                    let dirname = pathname.split(path.sep)[pathname.split(path.sep).length - 1]                    
                    if (folderStarts.includes(dirname.split('_')[0]))
                        mapDir(pathname, callback, finish)
                } else if (stats.isFile()) {
                    if (!['.html'].includes(path.extname(pathname))) {  // 仅处理目录下的html文件
                        return
                    }
                    //console.log(pathname)
                    fs.readFile(pathname, (err, data) => {
                        if (err) {
                            console.error(err)
                            return
                        }
                        callback && callback(pathname, data)
                    })
                }
            })
            if (index === files.length - 1) {
                finish && finish()
            }
        })
    })
}

mapDir(
    basePath,
    function (pathname, data) {
        let ix = String(data).indexOf(deletedStr)
        if(-1 == ix)
            return
        console.log('process:' + pathname)
        while (-1 != ix) {
            data = String(data).replace(deletedStr, '')
            ix = data.indexOf(deletedStr)
        }
        fs.writeFile(pathname, data, function (err) {
            if (err) {
                console.log(err)
                console.log(pathname)
            }
        })
    },
    function () {
        console.log('文件目录遍历完了')
    }
)


