<template>
  <div class="resource-link">
    <div class="resource-link__top">
      <h3 class="resource-link__heading">{{ title }}</h3>
      <a
        class="resource-link__action"
        :href="url"
        target="_blank"
        rel="noopener noreferrer"
      >
        {{ linkText }}
        <svg class="resource-link__icon" viewBox="0 0 12 12" aria-hidden="true">
          <path d="M3 2h5.5a.5.5 0 0 1 .5.5V8h-1V3.7L3.35 8.35l-.7-.7L7.3 3H3V2z" />
        </svg>
      </a>
    </div>
    <p class="resource-link__description">{{ description }}</p>
  </div>
</template>

<script>
export default {
  name: 'ResourceLink',
  props: {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    linkText: {
      type: String,
      default: 'Read more',
    },
  },
};
</script>

<style scoped>
.resource-link {
  padding: 20px 0;
  border-bottom: 1px solid var(--rl-line, #e5e5e5);
}

.resource-link:first-child {
  border-top: 1px solid var(--rl-line, #e5e5e5);
}

.resource-link__top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 6px;
}

.resource-link__heading {
  font-family: var(--rl-heading-font, 'Linux Libertine', Georgia, serif);
  font-weight: 700;
  font-size: 1.15rem;
  line-height: 1.3;
  margin: 0;
  color: var(--rl-ink, #202122);
}

.resource-link__action {
  flex-shrink: 0;
  color: var(--rl-link, #0645ad);
  font-weight: 700;
  font-size: 0.92rem;
  text-decoration: none;
  white-space: nowrap;
}

.resource-link__action:hover {
  text-decoration: underline;
}

.resource-link__icon {
  display: inline-block;
  width: 0.72em;
  height: 0.72em;
  margin-left: 0.28em;
  vertical-align: 0.05em;
}

.resource-link__icon path {
  fill: currentColor;
}

.resource-link__description {
  margin: 0;
  font-size: 0.96rem;
  line-height: 1.55;
  color: var(--rl-slate, #3a3d42);
  max-width: 62ch;
}

@media (max-width: 480px) {
  .resource-link__top {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}
</style>
