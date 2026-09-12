<template>
  <div class="flex min-h-screen flex-col bg-background text-foreground">
    <AppHeader />
    <main class="flex flex-1 flex-col">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>
