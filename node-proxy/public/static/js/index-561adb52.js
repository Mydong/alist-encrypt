import{d as s,a0 as e,e as t,i as a,j as r,C as i}from"./index-c42bf1ef.js";const b={class:"scroll-y"},l=i('<h3 class="mb-20px">alist-encrypt</h3><div class="rowSS"> # Alist-encrypt <br><br> 这个项目主要是对 alist 的服务进行代理，提供 webdav 的加解密功能。支持 alist 网页在线播放加密的视频，查看加密的图片等功能，同时在 webdav 下的操作透明，自动实现文件资源的加解密。 到目前为止，此项目的算法已经基本确定下来了，用RC4更安全，之前的mix混淆明文的方案其实也是可行的，但是作为加密的话，安全强度还不够，对付网盘当然是足够了。而RC4更加安全，由于使用nodejs进行实现，但是性能会稍微差一些（但是依然非常的高效，跑满100M 带宽没问题），mix混淆的方案是基本没有性能的开销。 算法确定下来后，接下来就可以正常实现业务了，release版本 应该很快就可以和大家见面了。体验版可以用docker进行体验。 因为项目前期会有很多bug，issue处理的讨论不太方便，讨论反馈群：422035582 <br><br> ## 一、需求背景 <br><br> AList 是一个支持多种存储、云网盘，支持网页浏览和提供 WebDAV 服务的应用程序。最近的阿里云盘很火，因为不限速，所以不少人使用阿里云盘配合 alist 当做个人的影院，随时在线观看视频。 国内的云盘有很多，除了阿里云盘还有天翼云盘也是不限速的，但是几乎都存在一个问题，敏感资源会被删除，相信很多人经历文件被删除掉的噩梦。那么有没有什么办法可以避免这样的问题呢，最简单的方案就是加密后上传。那么就有大局限性，不能实时在线播放视频，当然也有一些方案可以做到。加密后的文件分享也存在一定的不方便（密码不方便对外提供）。 Alist-encrypt 就是为了解决这个问题，它可以结合 webdav 服务器进行使用，在文件上传的时候进行加密，文件下载的时候进行解密，由于使用的是流加密方案，所以可以很轻松实现在线播放视频，浏览图片、文件等。目前主流的方案都是使用 alist 来实现网盘 webdav 的服务，所以 Alist-encrypt 支持 alist 服务，并且优先支持它的适配，支持网页版在线播放视频等功能。 关于这个项目的使用场景，对文件安全隐私有一定的需求，防止云盘扫描删除，有实时播放视频和下载的需求。 <br><br> ### 操作使用 <br><br> 1、alist 原本网页上的所有的操作都可以正常使用，因为 Alist-encrypt 它是透明代理，所以你所有的操作请求都是透传到 alist 上的，除了某些需要加密上传的操作和在线解密播放的操作。 2、你可以在 webdav 客户端上进行文件上传，如果设置了加密的文件夹目录，那么上传的文件就会被加密，在云盘上下载后会无法打开。但是你使用 Alist-encrypt 代理的 alist 服务还是一样可以正常下载查看，在线播放视频，查看图片等，不管是在 webdav 还是网页上都是正常使用。 3、除了可配置 alist 服务，也可以配置其他的 webdav 服务，同样也是在 conf/config.js 中。注意的是它的配置优先级高于 alist，会覆盖 alist 的代理路径，注意错开路径。如果无法避免和 alist 冲突，那么建议再运行多一个代理服务。 <br><br> ### 已支持的功能 <br><br> 1. 支持 alist 网页在线播放加密的视频，查看图片，在线下载等。 2. 支持 alist 网页跳转到 IINA，VLC，Infuse 等播放器上进行播放。 3. 在 webdav 客户端上的所有操作不会受到影响，自动加解密，可播放视频、查看图片。 <br><br> ### 待实现功能 <br><br> 1. 提供界面配置 alist 和 webdav 的信息。 2. 提供 cli 程序进行文件解密\\加密，用于分享对方在下载后解密。 3. 提供原文件和加密文件找回加密钥匙 encode。 4. 可以把未加密(或已加密)的文件夹 A（或文件） -&gt; 转存到加密文件夹 B 中，用于转存别人分享的文件。 5. 设置不同目录不同密码，后续会支持，当前可以使用配置多个 webdav 服务来支持。 <br><br> ### 已知问题 <br><br> - 在alist上传文件，不能用from方式 - 阿里云盘无法使用 Aliyun Video Previewer 进行播放，请选择 Video 方式播放、 <br><br> 当前版本还不具备生产使用的条件，只是基本实现部分功能，还有很多网盘没测试，预计再迭代 2 个版本才能看到更完整的功能。此项目会关注 alist 那边的更新，持续适配 alist，也希望大家多多支持，提些建议。 </div>',2),c=[l],o=s({}),v=Object.assign(o,{__name:"index",setup(n){return e(t()),(d,_)=>(a(),r("div",b,c))}});export{v as default};
