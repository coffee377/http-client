<template>
  <div v-if="data" class="bg-gray-50 font-sans text-gray-800 min-h-screen">
    <main class="container mx-auto px-4 py-8">
      <div class="max-w-5xl mx-auto">
        <!-- Profile Header -->
        <div
          class="bg-white rounded-2xl shadow-lg overflow-hidden mb-8 transform transition-all duration-500 hover:shadow-xl"
        >
          <div class="bg-gradient-to-r from-blue-600 to-indigo-700 h-32"></div>
          <div class="px-6 -mt-16 mb-6">
            <div class="flex flex-col md:flex-row items-start md:items-end gap-6">
              <img
                :src="data.avatar_url"
                :alt="`${data.login}'s avatar`"
                class="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
              />
              <div class="text-center md:flex-1 md:flex md:items-center md:gap-4 md:text-left">
                <h2 class="text-2xl font-bold text-gray-900">{{ data.login }}</h2>
                <p class="text-gray-500 md:flex-1 mt-1 capitalize">GitHub User since {{ createdAt }}</p>
                <div class="flex flex-wrap gap-2 mt-4 md:mt-0 justify-center md:justify-end">
                  <a :href="data.html_url" target="_blank">
                    <button
                      class="w-32 inline-flex justify-center items-center gap-1 px-4 py-2 bg-gray-100 hover:cursor-pointer hover:bg-gray-200 text-gray-800 rounded-lg transition-colors"
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
                    class="w-32 inline-flex justify-center items-center gap-1 px-4 py-2 hover:cursor-pointer rounded-lg transition-colors"
                  >
                    <i class="fa" :class="{ 'fa-star': following, 'fa-star-o': !following }" />
                    <span class="w-24">{{ following ? 'Follow' : 'Unfollow' }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Stats Overview -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div class="stat-card">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-primary">
                <i class="fa fa-code-fork text-xl" />
              </div>
              <div>
                <p class="text-gray-500 text-sm">Public Repos</p>
                <p class="text-2xl font-bold">{{ data.public_repos }}</p>
              </div>
            </div>
          </div>

          <div class="stat-card">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <i class="fa fa-users text-xl"></i>
              </div>
              <div>
                <p class="text-gray-500 text-sm">Followers</p>
                <p class="text-2xl font-bold">{{ data.followers }}</p>
              </div>
            </div>
          </div>

          <div class="stat-card">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                <i class="fa fa-user-plus text-xl"></i>
              </div>
              <div>
                <p class="text-gray-500 text-sm">Following</p>
                <p class="text-2xl font-bold">{{ data.following }}</p>
              </div>
            </div>
          </div>

          <div class="stat-card">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                <i class="fa fa-hdd-o text-xl"></i>
              </div>
              <div>
                <p class="text-gray-500 text-sm">Disk Usage</p>
                <p class="text-2xl font-bold">{{ data.disk_usage }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Content Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Left Column -->
          <div class="lg:col-span-1">
            <div v-if="showPersonalInformation" class="bg-white rounded-xl shadow-md p-6 mb-6">
              <h3 class="text-xl font-bold mb-4 flex items-center gap-2">
                <i class="fa fa-user-circle text-primary" /> Personal Information
              </h3>

              <div v-if="data.name" class="info-item">
                <i class="fa fa-id-card text-gray-400 mt-1 w-5 text-center" />
                <div>
                  <p class="text-gray-500 text-sm">Name</p>
                  <p class="font-medium">{{ data.name }}</p>
                </div>
              </div>

              <div v-if="data.company" class="info-item">
                <i class="fa fa-building text-gray-400 mt-1 w-5 text-center" />
                <div>
                  <p class="text-gray-500 text-sm">Company</p>
                  <p class="font-medium">{{ data.company }}</p>
                </div>
              </div>

              <div v-if="data.location" class="info-item">
                <i class="fa fa-map-marker text-gray-400 mt-1 w-5 text-center" />
                <div>
                  <p class="text-gray-500 text-sm">Location</p>
                  <p class="font-medium">{{ data.location }}</p>
                </div>
              </div>

              <div v-if="data.blog" class="info-item">
                <i class="fa fa-globe text-gray-400 mt-1 w-5 text-center" />
                <div>
                  <p class="text-gray-500 text-sm">Blog</p>
                  <p class="font-medium">{{ data.blog }}</p>
                </div>
              </div>

              <div v-if="data.twitter_username" class="info-item">
                <i class="fa fa-twitter text-gray-400 mt-1 w-5 text-center" />
                <div>
                  <p class="text-gray-500 text-sm">Twitter</p>
                  <p class="font-medium">{{ data.twitter_username }}</p>
                </div>
              </div>

              <div v-if="data.email" class="info-item">
                <i class="fa fa-envelope text-gray-400 mt-1 w-5 text-center" />
                <div>
                  <p class="text-gray-500 text-sm">Email</p>
                  <p class="font-medium">{{ data.email }}</p>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-xl shadow-md p-6">
              <h3 class="text-xl font-bold mb-4 flex items-center gap-2">
                <i class="fa fa-shield text-primary" /> Account Security
              </h3>

              <div class="info-item">
                <i class="fa fa-lock text-gray-400 mt-1 w-5 text-center"></i>
                <div>
                  <p class="text-gray-500 text-sm">Two-Factor Authentication</p>
                  <p
                    class="font-medium flex items-center gap-1"
                    :class="{
                      'text-green-600': data.two_factor_authentication,
                      'text-gray-400': !data.two_factor_authentication,
                    }"
                  >
                    <i class="fa fa-check-circle" />{{ data.two_factor_authentication ? 'Enabled' : 'Disabled' }}
                  </p>
                </div>
              </div>

              <div class="info-item">
                <i class="fa fa-calendar text-gray-400 mt-1 w-5 text-center" />
                <div>
                  <p class="text-gray-500 text-sm">Account Created</p>
                  <p class="font-medium">{{ createdAt }}</p>
                </div>
              </div>

              <div class="info-item">
                <i class="fa fa-refresh text-gray-400 mt-1 w-5 text-center" />
                <div>
                  <p class="text-gray-500 text-sm">Last Updated</p>
                  <p class="font-medium">{{ updatedAt }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column - Additional Info -->
          <div class="lg:col-span-2">
            <div class="bg-white rounded-xl shadow-md p-6 mb-6">
              <h3 class="text-xl font-bold mb-4 flex items-center gap-2">
                <i class="fa fa-github-alt text-primary" /> Repository Information
              </h3>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="info-item">
                  <i class="fa fa-code text-gray-400 mt-1 w-5 text-center" />
                  <div>
                    <p class="text-gray-500 text-sm">Public Repositories</p>
                    <p class="font-medium">{{ data.public_repos }}</p>
                  </div>
                </div>

                <div class="info-item">
                  <i class="fa fa-code-fork text-gray-400 mt-1 w-5 text-center"></i>
                  <div>
                    <p class="text-gray-500 text-sm">Private Repositories</p>
                    <p class="font-medium">{{ data.total_private_repos }}</p>
                  </div>
                </div>

                <div class="info-item">
                  <i class="fa fa-file-code-o text-gray-400 mt-1 w-5 text-center"></i>
                  <div>
                    <p class="text-gray-500 text-sm">Public Gists</p>
                    <p class="font-medium">{{ data.public_gists }}</p>
                  </div>
                </div>

                <div class="info-item">
                  <i class="fa fa-file-text-o text-gray-400 mt-1 w-5 text-center"></i>
                  <div>
                    <p class="text-gray-500 text-sm">Private Gists</p>
                    <p class="font-medium">{{ data.private_gists }}</p>
                  </div>
                </div>
              </div>

              <div class="mt-6">
                <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div class="h-full bg-primary rounded-full" :style="useRate"></div>
                </div>
                <div class="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0 GB</span>
                  <span>{{ data.disk_usage }} used</span>
                  <span>{{ data.plan.space }} total</span>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-xl shadow-md p-6">
              <h3 class="text-xl font-bold mb-4 flex items-center gap-2">
                <i class="fa fa-credit-card text-primary"></i> Plan Information
              </h3>
              <div class="flex items-center gap-3 mb-4">
                <span class="badge bg-green-100 text-green-800 capitalize">{{ data.plan.name }} Plan</span>
                <span class="text-gray-500">GitHub's free tier account</span>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="border border-gray-100 rounded-lg p-4">
                  <p class="text-gray-500 text-sm mb-1">Storage Space</p>
                  <p class="font-bold text-lg">{{ data.plan.space }}</p>
                </div>

                <div class="border border-gray-100 rounded-lg p-4">
                  <p class="text-gray-500 text-sm mb-1">Collaborators</p>
                  <p class="font-bold text-lg">{{ data.plan.collaborators }}</p>
                </div>

                <div class="border border-gray-100 rounded-lg p-4">
                  <p class="text-gray-500 text-sm mb-1">Private Repos</p>
                  <p class="font-bold text-lg">{{ data.plan.private_repos }}</p>
                </div>
              </div>

              <button
                v-if="data.plan.name === 'free'"
                class="mt-6 w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors font-medium"
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
import { useGitHubUser } from '@@/demo/hooks';
import { computed, ref, unref } from 'vue';

const following = ref(false);

interface GitHubUserProps {
  username?: string;
}

const props = withDefaults(defineProps<GitHubUserProps>(), { username: 'coffee377' });

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
