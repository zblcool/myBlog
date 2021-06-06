<template>
  <div class="start">
    <div class="imgContainer">
      <!-- <img src="/pics/pac-man-new.gif" alt="!" /> -->
      <img src="/pics/portfolios/VM-Card.png" width="600">
    </div>
    <div class="gifContainer">
      <img src="/pics/portfolios/VM-1.gif" alt="1" width="400" height="200" />
      <img src="/pics/portfolios/VM-2.gif" alt="1" width="400" height="200" />
      <img src="/pics/portfolios/VM-3.gif" alt="1" width="400" height="200" />
      <img src="/pics/portfolios/VM-4.gif" alt="1" width="400" height="200" />

      <img src="/pics/portfolios/VM-5.gif" alt="1" width="400" height="200" />
    </div>
  </div>
</template>
<style lang="stylus">
.content-wrapper {
  max-width: 70% !important;
  //  margin-bottom: 10%;
}
.footer{
  position:fixed;
  bottom:0;
  width:100%;
  z-index:3;
}
</style>
<style  scoped>
.imgContainer {
  /* background-color: #324e78; */
  /* width: 120px; */
}

.gifContainer {
  padding: 5%;
  height: 500px;
}
.gifContainer img {
  margin: 20px;
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