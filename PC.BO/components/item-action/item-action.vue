<!-- SCRIPT TEMPLATE -->
<script lang="ts">
// IMPORT VUE CLASS
import { Vue, Prop, Emit } from "vue-facing-decorator"
import type { ItemActionInterface } from "~/interfaces/item-action.interface";

type ActionType = 'delete' | 'update' | 'copy' | 'status'
const StatusTypes = ['publish', 'draft']
type StatusType = typeof StatusTypes[number];

export type ItemActionType = {
  itemID: string
  action: ActionType
  status?: StatusType
}

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: 'item-action-component',
  inheritAttrs: false 
})

class ItemActionComponent extends Vue {
  public StatusTypes = StatusTypes;
  public statusText: Record<StatusType, string> = {
    publish: "Publicado",
    draft: "Borrador"
  };

  ///////////////
  //// PROPS ////
  ///////////////

  // DRAWER OPTIONS
  @Prop({ required: true })
  onItemAction!: (itemAction: ItemActionType) => Promise<any>; // or specific return type

  @Prop({
    default: {
      item: {}
    }
  })
  item!: ItemActionInterface;

  @Prop({ type: Boolean, default: true }) update!: boolean;
  @Prop({ type: Boolean, default: false }) delete!: boolean;
  @Prop({ type: Boolean, default: false }) copy!: boolean;
  @Prop({ type: Boolean, default: false }) status!: boolean;
  
  // DIALOG DELETE ITEM OPTIONS
  public initDialog = () => ({
    show: false,
    title: '',
    subtitle: '',
    description: '',
    loading: false,
    callback: () => {}
  })

  public dialog = this.initDialog()

  public itemAction(action: ActionType, status?: string) {
    this.onItemAction({
      itemID: this.item._id,
      action,
      ...(status && {status: status})
    })
    .catch((err) => console.log("Error", err))
    .finally(()=> this.closeDialog())
  }
  // OPEN DIALOG ALERT REMOVE ITEM
  public openDialog(title: string, subtitle: string, description: string, callback: () => void) {
    this.dialog.show = true;
    this.dialog.title = title;
    this.dialog.subtitle = subtitle;
    this.dialog.description = description;
    this.dialog.callback = callback
  }

  public deleteItem() {
    this.openDialog("Advertencia", "una vez eliminado se pierde la imagen, y datos de este item!", `¿Estas seguro de quere eliminar el Item ${this.item.name}?`, () => {
      this.dialog.loading = true;
      this.itemAction('delete')
    })
  }

  public duplicateItem(){
    this.openDialog("Advertencia", "", `¿Estas seguro de querer duplicar el Item ${this.item.name}?`, () => {
      // SET LOADING
      this.dialog.loading = true;
      this.itemAction('copy')
    })
  }

  public switchStatus(status: string){
    const itemStatus = !this.item.status || this.item.status === 'publish'? this.statusText.draft:this.statusText.publish
    this.openDialog("Advertencia", "", `¿Estas seguro de querer cambiar el estado a ${itemStatus} para el Item ${this.item.name}?`, () => {
      // SET LOADING
      this.dialog.loading = true;
      this.itemAction('status', status)
    })
  }

  public closeDialog() {
    this.dialog = this.initDialog()
  }
}
export default ItemActionComponent;
</script>

<!-- HTML TEMPLATE -->
<template>
  <v-menu>
    <template v-slot:activator="{ props }">
      <v-btn icon="mdi-dots-vertical" variant="text" v-bind="{...$attrs, ...props}"></v-btn>
    </template>

    <v-list>
      <v-list-item v-if="update" @click="itemAction('update')"  >
          <template v-slot:prepend>
            <v-icon size="15">mdi-pencil</v-icon>
          </template>
          <v-list-item-title v-text="'Editar'"></v-list-item-title>
      </v-list-item>        
      <v-list-item v-if="delete" @click="deleteItem"  >
          <template v-slot:prepend>
            <v-icon size="15">mdi-delete</v-icon>
          </template>
          <v-list-item-title v-text="'Eliminar'"></v-list-item-title>
      </v-list-item>
      <v-list-item v-if="copy" @click="duplicateItem" >
          <template v-slot:prepend>
          <v-icon size="15">mdi-content-copy</v-icon>
          </template>
          <v-list-item-title v-text="'Duplicar'"></v-list-item-title>
      </v-list-item>
      <v-list-item v-if="status">
        <template v-slot:prepend>
          <v-icon size="15">mdi-file-arrow-left-right</v-icon>
        </template>
        <v-list-item-title v-text="'Estado'"></v-list-item-title>
        <template v-slot:append>
          <v-icon icon="mdi-menu-right" size="x-small"></v-icon>
        </template>
        <v-menu :open-on-focus="false" activator="parent" open-on-hover submenu>
          <v-list>
            <v-list-item v-for="statusText, status in statusText" :key="status" link @click="switchStatus(status)">
              <v-list-item-title>{{ statusText }}</v-list-item-title>
              <template v-slot:append v-if="item.status == status || !item.status && status == 'publish'">
                <v-icon icon="mdi-check" size="x-small"></v-icon>
              </template>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-list-item>
    </v-list>
  </v-menu>

  <teleport to="body">
    <!-- DIALOG DELETE SLIDER -->
    <v-dialog v-model="dialog.show" max-width="480">
      <v-card class="" rounded="xl" color="primary">
        <v-card-item>
          <v-card-title class="text-body-1 text-orange">{{dialog.title}}</v-card-title>
          <v-card-subtitle class="text-caption">{{dialog.subtitle}}</v-card-subtitle>
        </v-card-item>
        <v-card-text>
          <p class="my-2"><strong>{{dialog.description}}</strong></p>
        </v-card-text>
        <v-card-actions>
          <v-btn text="Cancelar" variant="text" @click="closeDialog()" />
          <v-spacer />
          <v-btn text="Aceptar" variant="text" @click="dialog.callback()" :loading="dialog.loading" />
        </v-card-actions>
      </v-card>
    </v-dialog>
  </teleport>
</template>