<template>
  <div v-if="data" class="min-h-screen bg-gray-50 font-sans text-gray-800">
    <main class="container mx-auto px-4 py-8">
      <div class="mx-auto max-w-5xl">
        <!-- Profile Header -->
        <div
          class="mb-8 transform overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-500 hover:shadow-xl"
        >
          <div class="h-32 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
          <div class="-mt-16 mb-6 px-6">
            <div class="flex flex-col items-start gap-6 md:flex-row md:items-end">
              <img
                :src="data.avatar_url"
                :alt="`${data.login}'s avatar`"
                class="h-32 w-32 rounded-full border-4 border-white object-cover shadow-lg"
              />
              <div class="text-center md:flex md:flex-1 md:items-center md:gap-4 md:text-left">
                <h2 class="text-2xl font-bold text-gray-900">{{ data.login }}</h2>
                <p class="mt-1 text-gray-500 capitalize md:flex-1">GitHub User since {{ createdAt }}</p>
                <div class="mt-4 flex flex-wrap justify-center gap-2 md:mt-0 md:justify-end">
                  <a :href="data.html_url" target="_blank">
                    <button
                      class="inline-flex w-32 items-center justify-center gap-1 rounded-lg bg-gray-100 px-4 py-2 text-gray-800 transition-colors hover:cursor-pointer hover:bg-gray-200"
                    >
                      <i class="fa fa-github" />
                      View Profile
                    </button>
                  </a>
                  <button
                    @click="toggleFollowing"
                    :class="{
                      'bg-primary hover:bg-primary/90 text-white': following,
                      'bg-gray-100 text-gray-800': !following,
                    }"
                    class="inline-flex w-32 items-center justify-center gap-1 rounded-lg px-4 py-2 transition-colors hover:cursor-pointer"
                  >
                    <i class="fa" :class="{ 'fa-star': following, 'fa-star-o': !following }" />
                    <span class="w-24">{{ following ? "Follow" : "Unfollow" }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Stats Overview -->
        <div class="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div class="stat-card">
            <div class="flex items-center gap-3">
              <div class="text-primary flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <i class="fa fa-code-fork text-xl" />
              </div>
              <div>
                <p class="text-sm text-gray-500">Public Repos</p>
                <p class="text-2xl font-bold">{{ data.public_repos }}</p>
              </div>
            </div>
          </div>

          <div class="stat-card">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
                <i class="fa fa-users text-xl"></i>
              </div>
              <div>
                <p class="text-sm text-gray-500">Followers</p>
                <p class="text-2xl font-bold">{{ data.followers }}</p>
              </div>
            </div>
          </div>

          <div class="stat-card">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                <i class="fa fa-user-plus text-xl"></i>
              </div>
              <div>
                <p class="text-sm text-gray-500">Following</p>
                <p class="text-2xl font-bold">{{ data.following }}</p>
              </div>
            </div>
          </div>

          <div class="stat-card">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                <i class="fa fa-hdd-o text-xl"></i>
              </div>
              <div>
                <p class="text-sm text-gray-500">Disk Usage</p>
                <p class="text-2xl font-bold">{{ data.disk_usage }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Content Grid -->
        <div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <!-- Left Column -->
          <div class="lg:col-span-1">
            <div v-if="showPersonalInformation" class="mb-6 rounded-xl bg-white p-6 shadow-md">
              <h3 class="mb-4 flex items-center gap-2 text-xl font-bold">
                <i class="fa fa-user-circle text-primary" /> Personal Information
              </h3>

              <div v-if="data.name" class="info-item">
                <i class="fa fa-id-card mt-1 w-5 text-center text-gray-400" />
                <div>
                  <p class="text-sm text-gray-500">Name</p>
                  <p class="font-medium">{{ data.name }}</p>
                </div>
              </div>

              <div v-if="data.company" class="info-item">
                <i class="fa fa-building mt-1 w-5 text-center text-gray-400" />
                <div>
                  <p class="text-sm text-gray-500">Company</p>
                  <p class="font-medium">{{ data.company }}</p>
                </div>
              </div>

              <div v-if="data.location" class="info-item">
                <i class="fa fa-map-marker mt-1 w-5 text-center text-gray-400" />
                <div>
                  <p class="text-sm text-gray-500">Location</p>
                  <p class="font-medium">{{ data.location }}</p>
                </div>
              </div>

              <div v-if="data.blog" class="info-item">
                <i class="fa fa-globe mt-1 w-5 text-center text-gray-400" />
                <div>
                  <p class="text-sm text-gray-500">Blog</p>
                  <p class="font-medium">{{ data.blog }}</p>
                </div>
              </div>

              <div v-if="data.twitter_username" class="info-item">
                <i class="fa fa-twitter mt-1 w-5 text-center text-gray-400" />
                <div>
                  <p class="text-sm text-gray-500">Twitter</p>
                  <p class="font-medium">{{ data.twitter_username }}</p>
                </div>
              </div>

              <div v-if="data.email" class="info-item">
                <i class="fa fa-envelope mt-1 w-5 text-center text-gray-400" />
                <div>
                  <p class="text-sm text-gray-500">Email</p>
                  <p class="font-medium">{{ data.email }}</p>
                </div>
              </div>
            </div>

            <div class="rounded-xl bg-white p-6 shadow-md">
              <h3 class="mb-4 flex items-center gap-2 text-xl font-bold">
                <i class="fa fa-shield text-primary" /> Account Security
              </h3>

              <div class="info-item">
                <i class="fa fa-lock mt-1 w-5 text-center text-gray-400"></i>
                <div>
                  <p class="text-sm text-gray-500">Two-Factor Authentication</p>
                  <p
                    class="flex items-center gap-1 font-medium"
                    :class="{
                      'text-green-600': data.two_factor_authentication,
                      'text-gray-400': !data.two_factor_authentication,
                    }"
                  >
                    <i class="fa fa-check-circle" />{{ data.two_factor_authentication ? "Enabled" : "Disabled" }}
                  </p>
                </div>
              </div>

              <div class="info-item">
                <i class="fa fa-calendar mt-1 w-5 text-center text-gray-400" />
                <div>
                  <p class="text-sm text-gray-500">Account Created</p>
                  <p class="font-medium">{{ createdAt }}</p>
                </div>
              </div>

              <div class="info-item">
                <i class="fa fa-refresh mt-1 w-5 text-center text-gray-400" />
                <div>
                  <p class="text-sm text-gray-500">Last Updated</p>
                  <p class="font-medium">{{ updatedAt }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column - Additional Info -->
          <div class="lg:col-span-2">
            <div class="mb-6 rounded-xl bg-white p-6 shadow-md">
              <h3 class="mb-4 flex items-center gap-2 text-xl font-bold">
                <i class="fa fa-github-alt text-primary" /> Repository Information
              </h3>

              <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div class="info-item">
                  <i class="fa fa-code mt-1 w-5 text-center text-gray-400" />
                  <div>
                    <p class="text-sm text-gray-500">Public Repositories</p>
                    <p class="font-medium">{{ data.public_repos }}</p>
                  </div>
                </div>

                <div class="info-item">
                  <i class="fa fa-code-fork mt-1 w-5 text-center text-gray-400"></i>
                  <div>
                    <p class="text-sm text-gray-500">Private Repositories</p>
                    <p class="font-medium">{{ data.total_private_repos }}</p>
                  </div>
                </div>

                <div class="info-item">
                  <i class="fa fa-file-code-o mt-1 w-5 text-center text-gray-400"></i>
                  <div>
                    <p class="text-sm text-gray-500">Public Gists</p>
                    <p class="font-medium">{{ data.public_gists }}</p>
                  </div>
                </div>

                <div class="info-item">
                  <i class="fa fa-file-text-o mt-1 w-5 text-center text-gray-400"></i>
                  <div>
                    <p class="text-sm text-gray-500">Private Gists</p>
                    <p class="font-medium">{{ data.private_gists }}</p>
                  </div>
                </div>
              </div>

              <div class="mt-6">
                <div class="h-2 overflow-hidden rounded-full bg-gray-200">
                  <div class="bg-primary h-full rounded-full" :style="useRate"></div>
                </div>
                <div class="mt-1 flex justify-between text-xs text-gray-500">
                  <span>0 GB</span>
                  <span>{{ data.disk_usage }} used</span>
                  <span>{{ data.plan.space }} total</span>
                </div>
              </div>
            </div>

            <div class="rounded-xl bg-white p-6 shadow-md">
              <h3 class="mb-4 flex items-center gap-2 text-xl font-bold">
                <i class="fa fa-credit-card text-primary"></i> Plan Information
              </h3>
              <div class="mb-4 flex items-center gap-3">
                <span class="badge bg-green-100 text-green-800 capitalize">{{ data.plan.name }} Plan</span>
                <span class="text-gray-500">GitHub's free tier account</span>
              </div>

              <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div class="rounded-lg border border-gray-100 p-4">
                  <p class="mb-1 text-sm text-gray-500">Storage Space</p>
                  <p class="text-lg font-bold">{{ data.plan.space }}</p>
                </div>

                <div class="rounded-lg border border-gray-100 p-4">
                  <p class="mb-1 text-sm text-gray-500">Collaborators</p>
                  <p class="text-lg font-bold">{{ data.plan.collaborators }}</p>
                </div>

                <div class="rounded-lg border border-gray-100 p-4">
                  <p class="mb-1 text-sm text-gray-500">Private Repos</p>
                  <p class="text-lg font-bold">{{ data.plan.private_repos }}</p>
                </div>
              </div>

              <button
                v-if="data.plan.name === 'free'"
                class="mt-6 w-full rounded-lg bg-gray-100 px-4 py-2 font-medium text-gray-800 transition-colors hover:bg-gray-200"
              >
                Upgrade to Pro
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useGitHubUser } from "@@/demo/hooks";
import { computed, ref, unref } from "vue";

const following = ref(false);

interface GitHubUserProps {
  username?: string;
}

const props = withDefaults(defineProps<GitHubUserProps>(), { username: "coffee377" });

const toggleFollowing = () => (following.value = !following.value);

const { data, loading, error, run, refresh } = useGitHubUser(props.username);

const createdAt = computed(() => new Date(Date.parse(data.value?.created_at)).toLocaleDateString());
const updatedAt = computed(() => new Date(Date.parse(data.value?.updated_at)).toLocaleDateString());

const showPersonalInformation = computed(() => {
  const { name, company, location, blog, twitter_username, email } = data.value;
  return [name, company, location, blog, twitter_username, email].some((item) => !!item);
});

const useRate = computed(() => {
  const {
    disk_usage,
    plan: { space },
  } = unref(data);

  return {
    width: `${(disk_usage / space) * 100}%`,
  };
});
</script>

<style scoped></style>
