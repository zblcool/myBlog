<template>
  <div class="card-wrap">
    <img :src="'/pics'+item.link" />
  </div>
</template>

<script>
export default {
  data() {
    return {
      item: {
        link: "/portfolios/VM-3.gif",
      },
    };
  },
};
</script>