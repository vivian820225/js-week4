const apiUrl = "https://course-ec-api.hexschool.io/";

new Vue({
  el: "#app",
  data: {
    products: [],
    tempProduct: {
      imageUrl: [],
    },
    isNew: false,
    status: {
      fileUploading: false,
    },
    pagination: {},
    user: {
      token: "",
      uuid: "21acf264-850e-4f92-95d0-23bf823dd286",
    },
  },
  created() {
    // 取得 token 的 cookies
    this.user.token = document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1");
    // 無法取得 token 則返回 login 頁面
    if (this.user.token === '') {
      window.location = 'login.html';
    }

    // 取得全部商品
    this.getProducts();
  },
  methods: {
    // 登出
    logout() {
      const api = `${apiUrl}api/auth/logout`;

      axios.post(api).then((res) => {
        if (res.success) {
          window.location = 'login.html';
        }
      }).catch((err) => {
        console.log(err);
      });
    },
    /**
     * 取得全部產品
     * @param page 頁碼，預設值是第一頁
     */
    getProducts(page = 1) {
      const api = `${apiUrl}api/${this.user.uuid}/admin/ec/products?page=${page}`;
      // 預設帶入 token
      axios.defaults.headers.common.Authorization = `Bearer ${this.user.token}`;

      axios.get(api).then((res) => {
        // console.log(res);
        this.products = res.data.data; // 取得商品列表
        this.pagination = res.data.meta.pagination; // 取得分頁資訊
      });
    },
    /**
     * 取得單一詳細產品資料
     * @param id 主要是傳入產品的 ID
     */
    getProduct(id) {
      const api = `${apiUrl}api/${this.user.uuid}/admin/ec/product/${id}`;
      axios.get(api).then((res) => {
        // 將取得的值回寫進 tempProduct
        this.tempProduct = res.data.data;
        // 確保資料已拿到再打開 modal
        $("#productModal").modal("show");
      }).catch((err) => {
        console.log(err);
      })
    },
    /**
    * 開啟 Modal 視窗
    * @param isNew 判斷目前是否為新增(true)或是編輯(false)
    * @param item 物件，主要用於傳入要編輯或刪除的產品資料
    */
    openModal(isNew, item) {
      // 利用傳入的參數來觸發指定事件
      switch (isNew) {
        case "new":
          // 新增商品須先清除原有暫存的資料
          this.tempProduct = {
            imageUrl: [],
          };
          // isNew 狀態切換為 true 表示新增商品
          this.isNew = true;
          // 開啟 modal
          $("#productModal").modal("show");
          break;
        case "edit":
          // 必須透過執行 getProduct 後取得單一商品資料
          this.getProduct(item.id);
          // 將狀態切換為 false 表示編輯
          this.isNew = false;
          break;
        case "delete":
          // 目前僅有一層物件，因此使用淺拷貝
          this.tempProduct = Object.assign({}, item);
          // 拷貝完畢後開啟 modal
          $("#delProductModal").modal("show");
          break;
        default:
          break;
      }
    },
    /**
     * 上傳產品資料
     * 透過 this.isNew 的狀態將會切換新增產品或編輯產品。
     * 附註新增為「post」編輯則是「patch」，patch 必須傳入產品 id
     */
    updateProduct() {
      // 新增商品
      let api = `${apiUrl}api/${this.user.uuid}/admin/ec/product`;
      let httpMethod = 'post';
      // 若不是新增新商品則切換為編輯商品的 API，並將方法改為 patch
      if (!this.isNew) {
        api = `${apiUrl}api/${this.user.uuid}/admin/ec/product/${this.tempProduct.id}`;
        httpMethod = 'patch';
      }

      // 預設帶入 token
      axios.defaults.headers.common.Authorization = `Bearer ${this.user.token}`;

      axios[httpMethod](api, this.tempProduct).then(() => {
        $("#productModal").modal("hide");
        this.getProducts(); // 重新取得全部商品列表資料
      }).catch((err) => {
        console.log(err);
      });
    },
    /**
     * 刪除產品
     * 透過 openModal 傳入的 this.tempProduct，並撈取 this.tempProduct.id 來刪除產品。
     * 由於在 delProductModal 會使用到產品的一些資訊，因此會需要拷貝一整份過來。
     */
    delProduct() {
      const api = `${apiUrl}api/${this.user.uuid}/admin/ec/product/${this.tempProduct.id}`;

      // 預設帶入 token
      axios.defaults.headers.common.Authorization = `Bearer ${this.user.token}`;

      axios.delete(api).then(() => {
        $("#delProductModal").modal("hide");
        this.getProducts(); // 重新取得全部商品列表資料
      });
    },
    /**
     * 上傳圖片
     */
    uploadFile() {
      const api = `${apiUrl}api/${this.user.uuid}/admin/storage`;
      // 選取 DOM 中的檔案資訊
      const uploadedFile = this.$refs.file.files[0];
      // 轉換成 FormData
      const formData = new FormData();
      // 新增 file 欄位
      formData.append('file', uploadedFile);
      this.status.fileUploading = true;

      axios.post(api, formData, {
        // 聲明傳遞的資料為 FormData 的格式
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }).then((res) => {
        this.status.fileUploading = false;
        // 200 為 HTTP 狀態碼 Successful responses 請求成功
        if (res.status === 200) {
          // 將圖片路徑傳進去
          this.tempProduct.imageUrl.push(res.data.data.path);
        }
      }).catch(() => {
        console.log('上傳不可超過 2MB');
        this.status.fileUploading = false;
      });
    },
  },
});
