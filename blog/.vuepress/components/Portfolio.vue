<template>
  <div class="start">
    <div class="imgContainer">
      <!-- <img src="/pics/pac-man-new.gif" alt="!" /> -->
    </div>
    <div class="gifContainer">
      <img src="/pics/portfolios/VM-1.gif" alt="1" width="400" height="200"/>
      <img src="/pics/portfolios/VM-2.gif" alt="1" width="400" height="200"/>
      <img src="/pics/portfolios/VM-3.gif" alt="1" width="400" height="200"/>
      <img src="/pics/portfolios/VM-4.gif" alt="1" width="400" height="200"/>

      <img src="/pics/portfolios/VM-5.gif" alt="1" width="400" height="200"/>
    </div>  
  </div>
</template>

<style lang="stylus" scoped>
.imgContainer {
  background-color: #324E78;
  width: 120px;
}
.content-wrapper{
  max-width:1000px !important;
}
.gifContainer{
  // background-color: #324E78;
  padding 5px;
  height :500px;
  img {
    margin :5px;
  }
}
 

.start {
  margin: 50px 0;
  position: relative;
  z-index: 2;

  > a {
    text-decoration: none;
    box-shadow: rgba(0, 0, 0, 0.4) 3px 3px 10px 0px;
    font-size: 1.2rem;
    border: 1px solid;
    padding: 0.8rem 1.6rem;
    border-radius: 6px;
    transition: 0.1s ease;
    box-sizing: border-box;
  }

  @media (max-width: $MQMobile) {
    display: flex;
    justify-content: center;
  }
}

p {
  font-size: 20px;
}

@media (max-width: $MQMobile) {
  .beginning {
    margin-top: 0 !important;
    text-align: center;
  }
}
</style>