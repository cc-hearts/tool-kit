<template>
  <!-- 不铺 bg-background：底色由 body 提供，方格纸底纹交给 GridBackdrop
       （fixed 铺满视口，观感与原先 body 背景一致），这里保持透明 -->
  <div class="flex min-h-screen flex-col text-foreground">
    <GridBackdrop />
    <AppHeader />
    <main class="flex flex-1 flex-col">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>
