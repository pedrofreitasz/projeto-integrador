import { Employee } from "../models/Employee.js";
import { User } from "../models/User.js";

export const getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.findAll();
    return res.status(200).json({ employees });
  } catch (error) {
    console.error("Erro ao buscar funcionários:", error);
    return res.status(500).json({
      message: "Não foi possível buscar os funcionários."
    });
  }
};

export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    if (parseInt(id) === req.employee.id) {
      return res.status(400).json({
        message: "Você não pode remover seu próprio perfil."
      });
    }

    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({
        message: "Funcionário não encontrado."
      });
    }

    await Employee.delete(id);

    return res.status(200).json({
      message: "Funcionário removido com sucesso."
    });
  } catch (error) {
    console.error("Erro ao deletar funcionário:", error);
    return res.status(500).json({
      message: "Não foi possível remover o funcionário."
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    return res.status(200).json({ users });
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return res.status(500).json({
      message: "Não foi possível buscar os usuários."
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        message: "Usuário não encontrado."
      });
    }

    await User.delete(id);

    return res.status(200).json({
      message: "Usuário removido com sucesso."
    });
  } catch (error) {
    console.error("Erro ao deletar usuário:", error);
    return res.status(500).json({
      message: "Não foi possível remover o usuário."
    });
  }
};


