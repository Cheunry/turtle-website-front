<template>
  <div class="friend_link">
    <div class="box_center cf" id="friendLink">
      <span>开发历程：</span>
      <a
        v-for="(item, index) in friendLinks"
        :key="index"
        target="_blank"
        :href="item.linkUrl"
        >{{ item.linkName }}
      </a>
    </div>
  </div>
</template>

<script>
export default {
  name: "FriendLink",
  setup() {
    // 直接写死友情链接数据
    const friendLinks = [
      {
        linkName: "Blog",
        linkUrl: "http://turtle-pie.space"
      },
      {
        linkName: "Github",
        linkUrl: "https://github.com/Cheunry/turtle-website"
      }
    ];

    return {
      friendLinks,
    };
  },
};
</script>