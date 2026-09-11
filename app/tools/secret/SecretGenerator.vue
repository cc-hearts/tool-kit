<script setup lang="ts">
import { RefreshCw } from 'lucide-vue-next'
import type { PasswordCharsetKey } from '~/utils/secret'
import { generatePassword, generateUUID, randomEncoded } from '~/utils/secret'

type Encoding = 'hex' | 'base64'

const activeTab = ref('aes')

/* ---------- AES 密钥 ---------- */
const aesMode = ref<'cbc' | 'gcm'>('cbc')
const aesKeyBits = ref<128 | 256>(256)
const aesEncoding = ref<Encoding>('hex')
const aesKey = ref('')
const aesIv = ref('')

async function generateAes() {
  const keyBytes = aesKeyBits.value / 8
  // CBC 使用 16 字节 IV，GCM 标准 nonce 为 12 字节
  const ivBytes = aesMode.value === 'cbc' ? 16 : 12
  aesKey.value = await randomEncoded(keyBytes, aesEncoding.value)
  aesIv.value = await randomEncoded(ivBytes, aesEncoding.value)
}

watch([aesMode, aesKeyBits, aesEncoding], generateAes)

/* ---------- 强密码 ---------- */
const passwordLength = ref(16)
const excludeAmbiguous = ref(false)
const checkedCharsets = ref<PasswordCharsetKey[]>(['lower', 'upper', 'digits'])
const charsetOptions: Array<{ key: PasswordCharsetKey, label: string, sample: string }> = [
  { key: 'lower', label: '小写字母', sample: 'a-z' },
  { key: 'upper', label: '大写字母', sample: 'A-Z' },
  { key: 'digits', label: '数字', sample: '0-9' },
  { key: 'symbols', label: '符号', sample: '!@#%' },
]
const password = ref('')

async function regeneratePassword() {
  password.value = await generatePassword({
    length: passwordLength.value,
    charsets: checkedCharsets.value,
    excludeAmbiguous: excludeAmbiguous.value,
  })
}

watch([passwordLength, checkedCharsets, excludeAmbiguous], regeneratePassword, { deep: true })

/* ---------- UUID ---------- */
const uuid = ref('')

function regenerateUuid() {
  uuid.value = generateUUID()
}

/* ---------- JWT Secret ---------- */
const jwtBits = ref<256 | 512>(256)
const jwtEncoding = ref<Encoding>('hex')
const jwtSecret = ref('')

async function generateJwt() {
  jwtSecret.value = await randomEncoded(jwtBits.value / 8, jwtEncoding.value)
}

watch([jwtBits, jwtEncoding], generateJwt)

onMounted(() => {
  generateAes()
  regeneratePassword()
  regenerateUuid()
  generateJwt()
})

/** 各标签页自己的重新生成入口 */
const regenerators: Record<string, () => void> = {
  aes: generateAes,
  password: regeneratePassword,
  uuid: regenerateUuid,
  jwt: generateJwt,
}
</script>

<template>
  <div class="mx-auto flex max-w-720px flex-col gap-4">
    <a-tabs v-model:activeKey="activeTab">
      <a-tab-pane key="aes" tab="AES 密钥">
        <a-form layout="vertical">
          <a-form-item label="参数">
            <a-space wrap>
              <a-radio-group v-model:value="aesMode" button-style="solid">
                <a-radio-button value="cbc">
                  CBC (IV 16B)
                </a-radio-button>
                <a-radio-button value="gcm">
                  GCM (Nonce 12B)
                </a-radio-button>
              </a-radio-group>
              <a-radio-group v-model:value="aesKeyBits" button-style="solid">
                <a-radio-button :value="128">
                  Key 128
                </a-radio-button>
                <a-radio-button :value="256">
                  Key 256
                </a-radio-button>
              </a-radio-group>
              <a-radio-group v-model:value="aesEncoding" button-style="solid">
                <a-radio-button value="hex">
                  HEX
                </a-radio-button>
                <a-radio-button value="base64">
                  Base64
                </a-radio-button>
              </a-radio-group>
            </a-space>
          </a-form-item>

          <a-form-item :label="`Key（${aesKeyBits / 8} 字节 / ${aesEncoding}）`">
            <a-typography-text :copyable="aesKey ? { text: aesKey } : false" code class="break-all">
              {{ aesKey || '生成中...' }}
            </a-typography-text>
          </a-form-item>
          <a-form-item :label="`${aesMode === 'cbc' ? 'IV' : 'Nonce'}（${aesMode === 'cbc' ? 16 : 12} 字节 / ${aesEncoding}）`" class="!mb-0">
            <a-typography-text :copyable="aesIv ? { text: aesIv } : false" code class="break-all">
              {{ aesIv || '生成中...' }}
            </a-typography-text>
          </a-form-item>
        </a-form>
      </a-tab-pane>

      <a-tab-pane key="password" tab="强密码">
        <a-form layout="vertical">
          <a-form-item label="长度">
            <a-slider v-model:value="passwordLength" :min="8" :max="64" :tip-formatter="(v: number) => `${v} 位`" />
          </a-form-item>
          <a-form-item label="字符集">
            <a-space wrap>
              <a-checkbox-group v-model:value="checkedCharsets" :options="charsetOptions.map(({ key, label }) => ({ label, value: key }))" />
              <a-checkbox v-model:checked="excludeAmbiguous">
                排除易混淆 (I l 1 O 0)
              </a-checkbox>
            </a-space>
          </a-form-item>
          <a-form-item class="!mb-0">
            <a-typography-paragraph
              :copyable="password ? { text: password } : false"
              code
              class="!mb-0 break-all"
            >
              {{ password || '请至少选择一种字符集' }}
            </a-typography-paragraph>
          </a-form-item>
        </a-form>
      </a-tab-pane>

      <a-tab-pane key="uuid" tab="UUID">
        <a-form layout="vertical">
          <a-form-item label="UUID v4" class="!mb-0">
            <a-typography-text :copyable="uuid ? { text: uuid } : false" code class="break-all">
              {{ uuid || '生成中...' }}
            </a-typography-text>
          </a-form-item>
        </a-form>
      </a-tab-pane>

      <a-tab-pane key="jwt" tab="JWT Secret">
        <a-form layout="vertical">
          <a-form-item label="参数">
            <a-space wrap>
              <a-radio-group v-model:value="jwtBits" button-style="solid">
                <a-radio-button :value="256">
                  256-bit
                </a-radio-button>
                <a-radio-button :value="512">
                  512-bit
                </a-radio-button>
              </a-radio-group>
              <a-radio-group v-model:value="jwtEncoding" button-style="solid">
                <a-radio-button value="hex">
                  HEX
                </a-radio-button>
                <a-radio-button value="base64">
                  Base64
                </a-radio-button>
              </a-radio-group>
            </a-space>
          </a-form-item>
          <a-form-item :label="`Secret（${jwtBits / 8} 字节 / ${jwtEncoding}）`" class="!mb-0">
            <a-typography-text :copyable="jwtSecret ? { text: jwtSecret } : false" code class="break-all">
              {{ jwtSecret || '生成中...' }}
            </a-typography-text>
          </a-form-item>
        </a-form>
      </a-tab-pane>
    </a-tabs>

    <a-button type="primary" block @click="regenerators[activeTab]?.()">
      <template #icon>
        <RefreshCw :size="14" />
      </template>
      重新生成
    </a-button>

    <p class="mb-0 text-center text-xs text-muted-foreground">
      所有随机数由浏览器 Web Crypto API 在本地生成，不会上传任何数据。
    </p>
  </div>
</template>
