---
title: Home
---
<vue-particles color="#787f85" :particleOpacity="0.4" :particlesNumber="30" shapeType="triangle" linesColor="#787f85"  ></vue-particles>
<img class="indexImg" src="/background.JPG" style="float:right;width: 50%;box-shadow:rgba(0, 0, 0, 0.4) 7px 13px 20px 0px;">
<p class="beginning"> 
   Hey, my name <br> is <b>Ash</b> .
</p>

<GetStarted/>
<p class="description"> A web developer who focuses on Computer Graphics </p>


<script>
//   window.onload = function (){
//     setTimeout(
//       function () {
//         // document.getElementById("svgBox").style.display = "none"
//         startLoading()
//       },
//       1
//     )
//   }

// function startLoading (){
//     // 获取path元素的引用
// var path = document.querySelector('#longRoad');
// console.log(path)
// // 获取path的长度
// var pathLength = path.getTotalLength();
// // 设置足够长的虚线和虚线之间的间隔，这里直接设置了path本身长度
// path.style.strokeDasharray = pathLength + ' ' + pathLength;
// // 设置虚线的位移为path本身的长度，使得path看起来完全隐藏了
// path.style.strokeDashoffset = pathLength;

// // 获取元素的大小及其相对于视口的位置
// // https://jakearchibald.com/2013/animated-line-drawing-svg/
// path.getBoundingClientRect();

// // 监听页面的滚动事件
// window.addEventListener("scroll", function(e) {  
//   // 获取滚动的百分比 
//   // https://stackoverflow.com/questions/2387136/cross-browser-method-to-determine-vertical-scroll-percentage-in-javascript/2387222#2387222
//   var scrollPercentage = (document.documentElement.scrollTop + document.body.scrollTop) / (document.documentElement.scrollHeight - document.documentElement.clientHeight);      
//   // 按照页面滚动百分比重新设置虚线的位移
//   var drawLength = pathLength * scrollPercentage;
//   path.style.strokeDashoffset = pathLength - drawLength;        
//   // 当页面快滑到底时，移除虚线，否则形状不是很锐利
//   if (scrollPercentage >= 0.99) {
//     path.style.strokeDasharray = "none";        
//   } else {
//     path.style.strokeDasharray = pathLength + ' ' + pathLength;
//   }  
// });
// }

</script>


<!-- <Portfolio/> -->
<style lang="stylus">
.content-wrapper {
  max-width: 70% !important;
}
</style>

<style lang="stylus" scoped>

#svgBox
  display: block;
.beginning
  font-size 60px
.description
  font-size 25px;
  color #818286

#particles-js
  position: absolute;
  z-index: 1;
  left:5%;
  width: 90%
  height: 80%
.indexImg  
  transition: all 0.8s cubic-bezier(0.165, 0.84, 0.44, 1)
  border-radius: 5px
  position: relative
  z-index: 2 !important
  &:hover
    transform: scale(1.02, 1.02) 
    &:after
      opacity: 1
  &:after
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3)
    opacity: 0
    /* -webkit-transition: all 0.8s cubic-bezier(0.165, 0.84, 0.44, 1) */
    transition: all 0.8s cubic-bezier(0.165, 0.84, 0.44, 1)

.aa 
  stroke-width:10;
  stroke: #000000;
  animation: lineMove 5s ease-out infinite;

.ss 
  stroke-width:10;
  stroke: #000000;
  animation: lineMove 5s ease-out infinite;

.hh 
  stroke-width:10;
  stroke: #000000;
  animation: lineMove 4s ease-out infinite;


@keyframes lineMove {
    0% {
        stroke-dasharray: 0, 700;
    }
    50% {
        stroke-dasharray: 700, 700;
        fill: rgba(0, 0, 0, 0);
        opacity: 1;
    }
    100% {
        stroke-dasharray: 700, 700;
        /* fill: rgba(40, 38, 37, 0.5); */
        opacity: 0;
    }
  }
@media (max-width: $MQMobile)
  .content-wrapper
    background: url(/background.JPG) !important
  .beginning
    margin-top 0 !important
    padding-top 50px !important
    /* text-align center */
  .indexImg
    float:none !important
    margin-top 10px !important
    width: 100% !important
    
  
</style>
