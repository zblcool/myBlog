---
title: About
---
<vue-particles color="#787f85" :particleOpacity="0.4" :particlesNumber="30" shapeType="triangle" linesColor="#787f85"  ></vue-particles>
<h1 class="beginning"> 
   Hi, Ash here.
  <img class="indexImg" src="/background.JPG" style="float:right;width: 50%;box-shadow:rgba(0, 0, 0, 0.4) 7px 13px 20px 0px">
</h1>

He is a boy who love to share what he knows

<GetStarted/>


<style lang="stylus" scoped>
p
  font-size 20px

#particles-js
  position: absolute;
  z-index: 1;
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
