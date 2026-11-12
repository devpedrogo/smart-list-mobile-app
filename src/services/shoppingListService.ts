import { api } from '@/api/client';
import { categoryToApi, mapShoppingGroups } from '@/api/adapters';
import type { ShoppingItemGroups, ShoppingItemPayload } from '@/types/shopping';

/**
 * Centraliza as operações da lista: envia alterações à API e converte a resposta
 * recebida para os grupos e categorias usados pelo aplicativo.
 */
export const shoppingListService = {
  /** Busca os itens no backend e adapta o formato da API para o modelo da tela. */
  async getAll(): Promise<ShoppingItemGroups> {
    const { data } = await api.get<unknown>('/shopping-items');
    return mapShoppingGroups(data);
  },
  /** Converte a categoria local para o formato da API antes de criar o item. */
  async add(payload: ShoppingItemPayload): Promise<void> {
    await api.post('/shopping-items', { ...payload, category: categoryToApi(payload.category) });
  },
  /** Atualiza os dados do item; codifica o ID para uso seguro na URL. */
  async update(id: string, payload: ShoppingItemPayload): Promise<void> {
    await api.put(`/shopping-items/${encodeURIComponent(id)}`, { ...payload, category: categoryToApi(payload.category) });
  },
  /** Solicita ao backend a alternância entre pendente e concluído. */
  async toggle(id: string): Promise<void> {
    await api.patch(`/shopping-items/${encodeURIComponent(id)}/toggle`);
  },
  /** Remove um item específico da lista. */
  async remove(id: string): Promise<void> {
    await api.delete(`/shopping-items/${encodeURIComponent(id)}`);
  },
  /** Remove em uma única operação todos os itens já concluídos. */
  async clearCompleted(): Promise<void> {
    await api.delete('/shopping-items/completed');
  },
};
