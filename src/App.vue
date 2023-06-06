
<template>
  <h1>Antv G6 Erd Demo</h1>
  <div class="map" ref="containerG6"></div>
  <h1>Antv X6 Erd Demo</h1>
  <div class="map" ref="containerX6"></div>
</template>

<script  setup lang="ts">
import { onMounted, ref } from 'vue';
import { nodes } from './mock/model-test';
import { ERDg6 } from './render/g6';
import { ERDx6 } from './render/x6';

const containerG6 = ref<HTMLElement | null>(null)
const containerX6 = ref<HTMLElement | null>(null)

onMounted(() => {

  if(containerG6.value){
    new ERDg6(containerG6.value).render(nodes)
  }
  if(containerX6.value){
    new ERDx6(containerX6.value).render(nodes)
  }

})

</script>

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

h1:first-child{
  margin-top: 40px;
}

.map{
  width:800px;height: 480px;background:#f6f6f6;
  box-shadow: 0 3px 6px 0 rgba(0,0,0,0.1);
  margin: 40px;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
