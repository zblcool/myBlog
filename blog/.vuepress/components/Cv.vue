<template>
  <div class="cv-wrap">
    <h1>Ash Zhang's CV</h1>
    <object
      data="/document/Ash-Zhang-CV.pdf"
      type="application/pdf"
      width="100%"
      height="800px"
    >
      <p>
        Alternative text - include a link
        <a href="/document/Ash-Zhang-CV.pdf">to the PDF!</a>
      </p>
    </object>
  </div>
</template>

<style lang="stylus" scoped>
.cv-wrap
    // height 800px
    display flex
    object
        align-items justify-self start
</style>

<style lang="stylus" >
.content-wrapper {
  max-width: 70% !important;
  // margin-bottom: 10%;
}
</style>
