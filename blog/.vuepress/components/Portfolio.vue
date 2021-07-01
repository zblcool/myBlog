<template>
  <div class="projectCard">
    <div class="imgContainer">
      <!-- <img src="/pics/pac-man-new.gif" alt="!" /> -->
      <img id="construction-sign" src="/pics/Under-Construction.jpeg" />
      <br />
      <br />
      <img src="/pics/VM/VM-3.gif" alt="1" width="400" height="200" />
      <img src="/pics/VM/VM-4.gif" width="400" height="200" />
      <img src="/pics/VM/VM-1.gif" alt="1" width="400" height="200" />
      <img src="/pics/VM/VM-2.gif" width="400" height="200" />
      <img src="/pics/VM/VM-solar.gif" alt="1" width="400" height="200" />
      <img src="/pics/VM/VM-tool.gif" width="400" height="200" />
      <img src="/pics/VM/VM-tool2.gif" width="400" height="200" />
    </div>
    <div class="gifContainer">
      <img
        src="/pics/portfolios/GalaxyConstructionCompany.png"
        alt="poster"
        width="400"
      />
      <!-- <iframe width="560" height="315" src="https://www.youtube.com/embed/fM_gqr0ZL3U" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe> -->

      <!-- <img src="/pics/portfolios/VM-2.gif" alt="1" width="400" height="200" />
      <img src="/pics/portfolios/VM-3.gif" alt="1" width="400" height="200" />
      <img src="/pics/portfolios/VM-4.gif" alt="1" width="400" height="200" />

      <img src="/pics/portfolios/VM-5.gif" alt="1" width="400" height="200" />
       -->
    </div>
  </div>
</template>
<style lang="stylus">
.content-wrapper {
  max-width: 70% !important;
  // margin-bottom: 10%;
}

.footer {
  position: fixed;
  bottom: 0;
  width: 100%;
  z-index: 3;
}
</style>
<style  scoped>
#construction-sign{
  float: left;
  position: relative;
  left: 15%;
  padding-bottom: 150px;
}
.imgContainer {
  /* background-color: #324e78; */
  /* width: 120px; */
  margin: 0 auto;
}
.imgContainer img {
  padding: 15px;
}
.gifContainer {
  padding: 5%;
  height: 500px;
}
.gifContainer img {
  margin: 20px;
}

.projectCard {
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