<template>
  <div id="channel-home">
    <v-parallax
      height="230"
      src="https://cdn.vuetifyjs.com/images/parallax/material.jpg"
    ></v-parallax>
    <div class="nav-bgcolor">
      <div id="channel-header">
        <v-container class="py-0">
          <v-row class="justify-space-between">
            <v-col cols="12" sm="5" md="5" lg="5" offset-md="1">
              <v-skeleton-loader
                type="list-item-avatar-two-line"
                :loading="loading"
                class="mr-1"
              >
                <v-card class="transparent" flat>
                  <v-list-item three-line>
                    <v-list-item-avatar size="80">
                      <v-img
                        v-if="channel.photoUrl !== 'no-photo.jpg'"
                        :src="`${url}/uploads/avatars/${channel.photoUrl}`"
                      ></v-img>

                      <v-avatar v-else color="red" size="60">
                        <span class="white--text headline ">
                          {{
                            channel.channelName.split('')[0].toUpperCase()
                          }}</span
                        >
                      </v-avatar>
                    </v-list-item-avatar>
                    <v-list-item-content class="align-self-auto">
                      <v-list-item-title class="headline mb-1">{{
                        channel.channelName
                      }}</v-list-item-title>
                      <v-list-item-subtitle> <strong>{{  3.1  }}</strong> RHC
                      </v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                </v-card>
              </v-skeleton-loader>
            </v-col>
            <v-col cols="12" sm="5" md="3" lg="3" v-if="!loading">
              <v-btn
                v-if="currentUser && channel._id !== currentUser._id"
                :class="[
                  { 'red white--text': !subscribed },
                  { 'grey grey--text lighten-3 text--darken-3': subscribed },
                  'mt-6'
                ]"
                tile
                large
                depressed
                :loading="subscribeLoading"
                @click="subscribe"
                >{{ !subscribed ? 'subscribe' : 'subscribed' }}</v-btn
              >
              <!-- <template v-else-if="!currentUser" -->
              <v-btn
                v-else-if="showSubBtn"
                :class="[
                  { 'red white--text': !subscribed },
                  { 'grey grey--text lighten-3 text--darken-3': subscribed },
                  'mt-6'
                ]"
                tile
                large
                depressed
                :loading="subscribeLoading"
                @click="subscribe"
                >{{ !subscribed ? 'subscribe' : 'subscribed' }}</v-btn
              >
              <!-- <v-btn icon class="ml-5 mt-6"><v-icon>mdi-bell</v-icon></v-btn> -->
            </v-col>
          </v-row>
        </v-container>
      </div>
      <v-card flat class="transparent">
        <v-tabs
          v-model="tab"
          background-color="transparent"
          show-arrows
          centered
          center-active
        >
          <v-tab v-for="(item, i) in items" :key="i">
            {{ item }}
          </v-tab>
        </v-tabs>

        <v-container fluid>
          <v-tabs-items v-model="tab" class="transparent">
            <v-tab-item>
              <v-card class="transparent" flat>
                <v-card-title>Uploads</v-card-title>
                <!-- <v-sheet class="mx-auto"> -->
                <v-slide-group class="pa-4" multiple show-arrows>
                  <v-slide-item
                    v-for="(video, i) in loading ? 5 : videos.data"
                    :key="i"
                  >
                    <v-skeleton-loader
                      type="card-avatar"
                      :loading="loading"
                      width="250px"
                      class="mr-1"
                    >
                      <video-card
                        :card="{ maxWidth: 250, type: 'noAvatar' }"
                        :video="video"
                        :channel="video.userId"
                      ></video-card>
                    </v-skeleton-loader>
                  </v-slide-item>
                </v-slide-group>
              </v-card>
            </v-tab-item>
            <v-tab-item>
              <v-card flat>
                <v-card-title>Uploads</v-card-title>
                <v-row>
                  <v-col
                    cols="12"
                    sm="6"
                    md="4"
                    lg="3"
                    v-for="(video, i) in loading ? 10 : videos.data"
                    :key="i"
                    class="mx-xs-auto"
                  >
                    <v-skeleton-loader type="card-avatar" :loading="loading">
                      <video-card
                        :card="{ maxWidth: 350 }"
                        :video="video"
                        :channel="video.userId"
                      ></video-card>
                    </v-skeleton-loader>
                  </v-col>
                </v-row>
              </v-card>
            </v-tab-item>
            <v-tab-item>
            </v-tab-item>
            <v-tab-item>
  <v-card>
    <v-card-title class="grey white--text text-h5">
      Your Keystore
    </v-card-title>
    <v-row
      class="pa-4"
      justify="space-between"
    >
      <v-col cols="5">
        <v-treeview
          :active.sync="active"
          :items="keyItems"
          :open.sync="open"
          activatable
          color="warning"
          open-on-click
          transition
        >
          <template v-slot:prepend="{ item }">
            <v-icon v-if="!item.children">
              mdi-key
            </v-icon>
          </template>
        </v-treeview>
      </v-col>
      <v-divider vertical></v-divider>

      <v-col
        class="d-flex text-center"
      >
        <v-scroll-y-transition mode="out-in">
          <div
            v-if="!selected"
            class="text-h6 grey--text text--lighten-1 font-weight-light"
            style="align-self: center;"
          >
            Select an Account
          </div>
          <v-card
            v-else
            :key="selected.id"
            class="pt-6 mx-auto"
            flat
            max-width="600"
          >
            <v-card-text>
              <vue-qrcode :value="`https://etherscan.io/address/${selected.pubkey}`" :options="{ width: 200 }"></vue-qrcode>

              <h3 class="text-h5 mb-2">
                <strong>{{ selected.name }}</strong>
              </h3>
              <div class="blue--text font-weight-bold">
                <h2>{{ selected.balance }} <strong>RBC</strong> </h2>
              </div>
            </v-card-text>
            <v-divider></v-divider>
            <v-row
              class="text-left"
              tag="v-card-text"
            >
              <v-col
                class="text-left mb-2"
                tag="strong"
                cols="3"
              >
                Address:
              </v-col>

              <v-col cols="9">
                <a
                  :href="`https://etherscan.io/address/${selected.pubkey}`"
                  target="_blank"
                >{{ selected.pubkey }}</a>
              </v-col>

              <v-col
                class="text-left mb-2"
                tag="strong"
                cols="3"
              >
                Key:
              </v-col>
              <v-col cols="9"> 
              <div class="font-semibold mt-1 mb-2 row">
              
              <v-col cols="8" v-if="!showPk">
                <div class="overflow-y-auto">*****************************************</div>
              </v-col>

              <v-col cols="8" v-if="showPk">
                <div class="overflow-y-auto">{{selected.key}}</div>
              </v-col>

              <v-col cols="2" v-if="!showPk">
              <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <v-icon
                      color="primary"
                      dark
                      v-bind="attrs"
                      v-on="on"
                      @click="onTogglePk"
                    >
                      mdi-eye
                    </v-icon>
                  </template>
                  <span>Show Key</span>
              </v-tooltip>
              </v-col>



              <v-col cols="2" v-if="showPk">
              <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <v-icon
                      color="primary"
                      dark
                      v-bind="attrs"
                      v-on="on"
                      @click="onTogglePk"
                    >
                      mdi-eye-off
                    </v-icon>
                  </template>
                  <span>Hide Key</span>
              </v-tooltip>
              </v-col>




              <v-col cols="2">
              <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <v-icon
                      color="primary"
                      dark
                      v-bind="attrs"
                      v-on="on"
                      @click="copyToClipboard"
                    >
                      mdi-content-copy
                    </v-icon>
                  </template>
                  <span>Copy Key</span>
              </v-tooltip>
              </v-col>
              </div>
              </v-col>
              <v-col
                class="text-left mb-2"
                tag="strong"
                cols="3"
              >
                Created On:
              </v-col>
              <v-col cols="9">{{ selected.created_at }}</v-col>
            </v-row>
          </v-card>
        </v-scroll-y-transition>
      </v-col>

    </v-row>
  </v-card>
            </v-tab-item>
            <v-tab-item>
              <v-card class="transparent" flat>
            <v-data-table
              no-data-text="No videos available, please upload video."
              :headers="headers"
              :items="videoRewards"
              loading-text="Loading... Please wait"
            >
            </v-data-table>

              </v-card>
            </v-tab-item>
          </v-tabs-items>
        </v-container>
      </v-card>
    </div>
    <signin-modal
      :openModal="signinDialog"
      :details="details"
      @closeModal="signinDialog = false"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import UserService from '@/services/UserService'
import VideoService from '@/services/VideoService'
import SubscriptionService from '@/services/SubscriptionService'

import VideoCard from '@/components/VideoCard'
import SigninModal from '@/components/SigninModal'
import moment from 'moment'
import VueQrcode from '@chenfengyuan/vue-qrcode';


export default {
  data: () => ({
    showPk: false,
    tab: null,
    loading: false,
    errored: false,
    subscribed: false,
    subscribeLoading: false,
    showSubBtn: true,
    url: process.env.VUE_APP_URL,
    items: ['Home', 'Videos', 'Playlists', 'Keys', 'Rewards', 'about'],
    videos: {},
    channel: {},
    signinDialog: false,
    details: {},
    headers: [
      {
        text: "Video",
        align: "start",
        value: "title",
      },
      { text: "Visibility", value: "status" },
      { text: "Views", value: "views" },
      { text: "Reward", value: "reward" },
      { text: "Value", value: "value" }
    ],
    active: [],
    avatar: null,
    open: [],
    videoRewards: [{
      title: "Eternals"
    }],
    keyItems: [],
    users: [{
    "id": 1,
    "name": "Account 1",
    "balance": "1.2",
    "pubkey": "0xb0dbf4c0ee985dd6fc8eef490ca2d73f830b13d4",
    "key": "573fddf1051bcf680a56a5b1f0a1f7f50c143a74209eadf697b72d4bbcd55e3a",
    "created_at" : 1625412592
  },
  {
    "id": 2,
    "name": "Account 2",
    "balance": "1.3",
    "pubkey": "0x1c7013b6c7250e6a8d6f87f22aa19fa8db89694f",
    "key" : "287098fe22934f2e41e6e4dfbcfb72f14ced4b064e508eaa6cc5607c270dbb2e",
    "created_at" : 1624410592
  },
  {
    "id": 3,
    "name": "Account 3",
    "balance": "0.64",
    "pubkey": "0x8a9413196552b77cc1dddbafe4f9ac29f8e162c2",
    "key" : "52dfbd6a28be68de1b0a90f9878e031846298b3368908b16c006ea9e0a1b551f",
    "created_at" : 1623402592
  },
  {
    "id": 4,
    "name": "Account 4",
    "balance": "0",
    "pubkey": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    "key" : "854e2e8fa1d484d180fc64d6ebe9b2d6abfe44e5905571a9e8b8e823d9cfaa80",
    "created_at" : 1622312592
  }]
  }),
  computed: {
    ...mapGetters(['isAuthenticated', 'currentUser']),
    selected () {
        console.log("selected", this.active.length)
        if (!this.active.length) return undefined

        const id = this.active[0]

        return this.users.find(user => user.id === id)
    }
  },
  components: {
    VideoCard,
    SigninModal,
    VueQrcode
  },
  methods: {

    onTogglePk() {
      console.log("onTogglePk")
      this.showPk = !this.showPk
    },

  copyToClipboard () {
  const el = document.createElement('textarea');
  el.value = this.users[0].key;
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
  },



    async getVideoRewards() {

      this.users = this.users.map((user) => {user.created_at = moment.unix(user.created_at).format('LLL'); return user})

      this.keyItems = [{
        name: 'Accounts',
        children :  this.users
      }]

      console.log(this.keyItems)

      this.loading = true;

      const videos = await VideoService.getAll("private", { limit: 0 })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => (this.loading = false));

      if (!videos) return;
      // console.log(videos)
      this.videoRewards = videos.data.data;

      // Coin is RBC R-hub Coin
      // Reward pe view is 0.01 coin
      // 1 Coin = 90 Rs

      this.videoRewards.map((videoReward) => {
        videoReward["reward"] = `${(videoReward['views'] * 0.01).toFixed(2)} RBC`
        videoReward["value"] = `${(videoReward['views'] * 0.01 * 90).toFixed(2)} INR`
      })
    },


    async getChannel(id) {
      // console.log(this.$route.params.id)
      this.loading = true
      this.errored = false

      const channel = await UserService.getById(id)
        .catch((err) => {
          this.errored = true
          console.log(err)
          this.$router.push('/')
        })
        .finally(() => (this.loading = false))

      if (!channel) return
      this.channel = channel.data.data
      // console.log(channel)
      if (this.currentUser && this.currentUser._id === this.channel._id) {
        this.showSubBtn = false
      } else {
        this.showSubBtn = true
      }
      this.getVideos()
      this.getVideoRewards()

      this.checkSubscription(this.channel._id)
      // console.log(channel)
    },
    async getVideos() {
      // this.getChannel()
      this.loading = true

      const videos = await VideoService.getAll('public', {
        userId: this.channel._id
      })
        .catch((err) => {
          console.log(err)
          this.errored = true
        })
        .finally(() => (this.loading = false))

      if (typeof videos === 'undefined') return

      this.videos = videos.data
    },
    async checkSubscription(id) {
      if (!this.currentUser) return
      this.loading = true
      const sub = await SubscriptionService.checkSubscription({ channelId: id })
        .catch((err) => {
          console.log(err)
        })
        .finally(() => {
          this.loading = false
        })
      // console.log(sub.data.data)
      if (!sub) return

      if (!sub.data.data._id) this.subscribed = false
      else this.subscribed = true
    },
    async subscribe() {
      if (!this.isAuthenticated) {
        this.signinDialog = true
        this.details = {
          title: 'Want to subscribe to this channel?',
          text: 'Sign in to subscribe to this channel.'
        }
        return
      }
      this.subscribeLoading = true
      const sub = await SubscriptionService.createSubscription({
        channelId: this.channel._id
      })
        .catch((err) => console.log(err))
        .finally(() => {
          this.subscribeLoading = false
        })

      if (!sub) return

      if (!sub.data.data._id) {
        this.subscribed = false
        this.channel.subscribers--
      } else {
        this.subscribed = true
        this.channel.subscribers++
      }

      // console.log(this.subscribed)
    }
  },
  mounted() {
    this.getChannel(this.$route.params.id)
  },
  beforeRouteUpdate(to, from, next) {
    this.getChannel(to.params.id)
    next()
  }
}
</script>

<style>
.nav-bgcolor {
  background: #f9f9f9;
}

.card {
  background: #f9f9f9 !important;
}

.v-tab {
  margin-right: 4em;
}

#channel-home .v-list-item--link:before {
  background-color: transparent;
}
</style>
