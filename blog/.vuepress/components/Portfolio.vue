<template>
  <div class="start">
      <div class="imgContainer">
          <img src="/pics/pac-man-new.gif" alt="!">
      </div>
    
  </div>
</template>

<style lang="stylus" scoped>
.imgContainer
    background-color : #324E78
    width :120px
.start
  margin 50px 0
  position relative
  z-index 2
  > a
    text-decoration none
    box-shadow:rgba(0,0,0,0.4) 3px 3px 10px 0px
    font-size 1.2rem
    border 1px solid
    padding 0.8rem 1.6rem
    border-radius 6px
    transition 0.1s ease
    box-sizing border-box
  @media (max-width: $MQMobile)
    display flex
    justify-content center
p
  font-size 20px
@media (max-width: $MQMobile)
  .beginning
    margin-top 0 !important
    text-align center
</style>