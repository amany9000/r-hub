<template>
  <v-dialog
    v-model="dialog"
    persistent
    transition="fab-transition"
    max-width="1000"
  >
    <v-card>
      <div class="d-flex justify-space-between mb-5" id="modal-header">
        <v-card-title class="py-3">Upload Video</v-card-title>
        <div class="mt-3 mr-2">
          <v-btn text>
            Upload With Classic
          </v-btn>
          <v-btn icon text @click="closeModal">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
      </div>

      <v-card-text
        v-if="!uploaded"
        class="d-flex flex-column align-center my-md-12 py-md-12 my-sm-8 py-sm-8 my-xs-0 py-xs-0 my-12 py-12"
      >
        <div v-if="!uploading" class="text-center">
          <div>
            <v-btn
              icon
              class="grey lighten-2 mb-4"
              style="height: 104px;width: 104px;"
              @click="selectFile"
              ><v-icon x-large class="grey--text text--darken-1"
                >mdi-upload</v-icon
              ></v-btn
            >
          </div>

          <ValidationProvider
            rules="required|size:50000"
            v-slot="{ errors }"
            name="file"
            ref="provider"
          >
            <v-file-input
              @change="uploadVideo"
              v-model="selectedFile"
              accept="video/mp4"
              placeholder="Pick an video"
              prepend-icon="mdi-video"
              :error-messages="errors"
              ref="fileInput"
            ></v-file-input>
          </ValidationProvider>
          <v-btn
            type="submit"
            depressed
            @click="$refs.fileInput.$refs.input.click()"
            class="blue darken-3 flat white--text mt-4"
            >Select File</v-btn
          >
        </div>

        <v-progress-circular
          v-else
          :rotate="360"
          :size="100"
          :width="15"
          :value="value"
          color="teal"
        >
          {{ value }}
        </v-progress-circular>
      </v-card-text>
      <v-card-text v-else>
        <h2 class="mb-6">Details</h2>
        <v-row>
          <v-col
            order="last"
            order-sm="last"
            order-md="first"
            order-lg="first"
            order-xl="first"
            cols="12"
            sm="12"
            md="8"
            lg="8"
          >
            <ValidationObserver ref="form">
              <form @submit.prevent="submit">
                <ValidationProvider
                  v-slot="{ errors }"
                  name="Title"
                  rules="required|min:3"
                >
                  <v-text-field
                    v-model="formData.title"
                    :error-messages="errors"
                    label="Title (required)"
                    class="mb-3"
                    filled
                    dense
                    counter="100"
                    max-length="100"
                  ></v-text-field>
                </ValidationProvider>
                <ValidationProvider
                  v-slot="{ errors }"
                  name="Description"
                  rules="required|min:3"
                >
                  <v-textarea
                    filled
                    auto-grow
                    :error-messages="errors"
                    label="Description"
                    placeholder="Tell viewers about your video"
                    rows="5"
                    counter="5000"
                    max-length="5000"
                    v-model="formData.description"
                    row-height="20"
                  ></v-textarea>
                </ValidationProvider>
                <ValidationProvider
                  v-slot="{ errors }"
                  name="Visibilty"
                  rules="required|min:3"
                >
                  <v-select
                    :items="visibilty"
                    :error-messages="errors"
                    filled
                    label="Visibilty"
                    v-model="formData.visibilty"
                  ></v-select>
                </ValidationProvider>
                <ValidationProvider
                  v-slot="{ errors }"
                  name="Cateogry"
                  rules="required|min:3"
                >
                  <v-select
                    :items="categoriesTitles"
                    :error-messages="errors"
                    filled
                    label="Categories"
                    v-model="formData.category"
                    :loading="categoryLoading"
                  ></v-select>
                </ValidationProvider>

                <div class="mt-6 d-flex justify-space-between">
                  <v-btn
                    :loading="submitLoading"
                    type="submit"
                    class="primary"
                    depressed
                    >Submit</v-btn
                  >
                </div>
              </form>
            </ValidationObserver>
          </v-col>
          <v-col
            order-sm="1"
            cols="12"
            sm="12"
            md="4"
            lg="4"
            class="text-center"
          >
            <v-btn text @click="toggleShow">Upload Thumbnails</v-btn>
            <my-upload
              field="thumbnail"
              @crop-success="cropSuccess"
              method="PUT"
              v-model="show"
              :width="1280"
              :height="720"
              :url="url"
              :headers="headers"
              img-format="jpg"
              langType="en"
            ></my-upload>
            <v-responsive width="330" class="mx-auto">
              <div v-if="!imgDataUrl" class="px-12" id="image-placeholder">
                <v-icon>mdi-image-plus</v-icon>
              </div>
              <v-img
                v-else
                max-width="330"
                height="350"
                :src="imgDataUrl"
              ></v-img>
            </v-responsive>
            <p v-if="imgDataUrl == ''" class="red--text">
              Please upload thumbnail
            </p>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions v-if="!uploaded">
        <p class="text-center grey--text caption px-12 px-xs-0">
          By submitting your videos to YouTube, you acknowledge that you agree
          to YouTube's Terms of Service and Community Guidelines. Please be sure
          not to violate others' copyright or privacy rights. Learn more
        </p>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import myUpload from "vue-image-crop-upload";
import VideoService from "@/services/VideoService";
import CategoryService from "@/services/CategoryService";
export default {
  name: "UploadModal",
  props: ["openDialog"],
  data: function () {
    return {
      // dialog: this.openDialog ? this.openDialog : false,
      valid: false,
      uploaded: false,
      uploading: false,
      submitLoading: false,
      categoryLoading: false,
      interval: {},
      value: 0,
      show: false,
      rules: [
        (value) =>
          !value ||
          value.size > 50000000 ||
          `Video size should be less than 50 MB!, ${value.size}`,
      ],
      categoriesTitles: [],
      categories: [],
      visibilty: ["Public", "Private"],
      selectedFile: [],
      formData: {
        id: "",
        title: "",
        description: "",
        category: "",
        visibilty: "",
      },
      imgDataUrl: "",
      url: "",
      headers: { Authorization: `Bearer ${this.$store.getters.getToken}` },
    };
  },
  computed: {
    dialog() {
      return this.openDialog;
    },
  },
  methods: {
    async uploadVideo(e) {
      const { valid } = await this.$refs.provider.validate(e);

      if (!valid) return;
      // console.log(this.selectedFile)

      this.uploading = true;
      const fd = new FormData();
      fd.append("video", this.selectedFile, this.selectedFile.name);

      let video = await VideoService.uploadVideo(fd, {
        onUploadProgress: (uploadEvent) => {
          this.value = Math.round(
            (uploadEvent.loaded / uploadEvent.total) * 100
          );
        },
      })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
          this.uploaded = true;
          this.uploading = false;
        });

      if (!video) return;
      video = video.data.data;

      this.formData.id = video._id;
      this.formData.title = video.title;
      this.formData.description = video.description;
      this.formData.cateogry = video.cateogry;
      this.url = `${process.env.VUE_APP_URL}/api/v1/videos/${video._id}/thumbnails`;
      // this.interval = setInterval(() => {
      //   if (this.value === 100) {
      //     this.uploaded = true
      //     clearInterval(this.inte-rval)
      //   }
      //   this.value += 10
      // }, 1000)
      // }
      // }
    },
    async submit() {
      if (this.imgDataUrl == "") return;
      this.submitLoading = true;
      this.formData.category = this.categories.find(
        (category) => category.title === this.formData.category
      )._id;

      const video = await VideoService.updateVideo(this.formData.id, {
        title: this.formData.title,
        description: this.formData.description,
        categoryId: this.formData.category,
        status: this.formData.visibilty.toLowerCase(),
      })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
          this.submitLoading = false;
          this.uploaded = false;
        });

      if (!video) return;
      // this.$nextTick(() => {
      //   this.$refs.form.reset()
      // })
      this.formData.visibilty = "";
      this.imgDataUrl = "";
      this.selectedFile = [];
      this.closeModal();

      this.$router.push(`/studio/videos?${new Date()}`);
      // console.log('submittied')
    },
    async getCategories() {
      this.categoryLoading = true;
      const categories = await CategoryService.getAll()
        .catch((err) => {
          console.log(err);
        })
        .finally(() => (this.categoryLoading = false));

      this.categoriesTitles = categories.data.data.map((category) => {
        return category.title;
      });
      this.categories = categories.data.data;
    },
    closeModal() {
      this.$emit("closeDialog");
    },
    selectFile() {
      this.$refs.fileInput.$refs.input.click();
    },
    toggleShow() {
      this.show = !this.show;
    },
    cropSuccess(imgDataUrl, field) {
      console.log("-------- crop success --------");
      console.log(field);
      this.imgDataUrl = imgDataUrl;
    },
  },
  components: {
    myUpload,
  },
  mounted() {
    this.getCategories();
  },
};
</script>

<style lang="scss">
#modal-header {
  border-bottom: 1px solid rgb(238, 232, 232);
}

#image-placeholder {
  padding-top: 8em;
  padding-bottom: 8em;
  border: 2px dashed rgb(209, 209, 209);
}
</style>
